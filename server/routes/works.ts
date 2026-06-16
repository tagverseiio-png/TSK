import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { processVideoPipeline } from "../utils/videoProcessor";
import { getDb } from "../lib/db";

const router = Router();
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// ─── GET all works (public) ───────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { db } = await getDb();
    const works = await db.collection("caseStudies").find({}).sort({ number: 1 }).toArray();
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(works);
  } catch (err) {
    console.error("Fetch all works error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch works",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── GET single work by slug (public) ────────────────────────────────────────
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { db } = await getDb();
    const work = await db.collection("caseStudies").findOne({ slug: req.params.slug });
    if (!work) return res.status(404).json({ error: "Not found" });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(work);
  } catch (err) {
    console.error("Fetch work by slug error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch work",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── POST upload media files (admin) ─────────────────────────────────────────
router.post(
  "/upload-media",
  requireAuth,
  upload.array("files", 20),
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results = [];
      for (const f of files) {
        const isVideo = f.mimetype.startsWith("video/");
        if (isVideo) {
          const baseFilename = f.filename.replace(/\.[^/.]+$/, "");
          const inputPath = path.join(__dirname, "../uploads/works", f.filename);
          const outputDir = path.join(__dirname, "../uploads/works");
          const hlsOutputDir = path.join(__dirname, "../uploads/works/hls", baseFilename);

          const stdFilename = `${baseFilename}_compressed.mp4`;
          const highFilename = `${baseFilename}_high.mp4`;
          const lowFilename = `${baseFilename}_low.mp4`;
          const posterFilename = `${baseFilename}_poster.webp`;
          const hlsMaster = "master.m3u8";

          // Start background processing
          processVideoPipeline(
            inputPath,
            outputDir,
            baseFilename,
            hlsOutputDir
          ).catch((e) => console.error("Background video processing failed:", e));

          results.push({
            type: "video",
            filename: stdFilename,
            url: `${BASE_URL}/uploads/works/${stdFilename}`,
            srcHigh: `${BASE_URL}/uploads/works/${highFilename}`,
            srcLow: `${BASE_URL}/uploads/works/${lowFilename}`,
            poster: `${BASE_URL}/uploads/works/${posterFilename}`,
            hlsUrl: `${BASE_URL}/uploads/works/hls/${baseFilename}/${hlsMaster}`,
            originalName: f.originalname,
            size: f.size,
            compressedSize: f.size // Will be unknown until processing finishes
          });
        } else {
          results.push({
            type: "image",
            filename: f.filename,
            url: `${BASE_URL}/uploads/works/${f.filename}`,
            originalName: f.originalname,
            size: f.size,
          });
        }
      }

      return res.json(results);
    } catch (err) {
      console.error("Upload works media error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ─── Chunked upload: temp directory and multer for chunks ─────────────────────
const CHUNKS_DIR = path.join(__dirname, "../uploads/chunks");
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

const chunkStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CHUNKS_DIR),
  filename: (req, _file, cb) => {
    const uploadId = req.body.uploadId || "unknown";
    const chunkIndex = req.body.chunkIndex || "0";
    cb(null, `${uploadId}_chunk_${chunkIndex}`);
  },
});
const chunkUpload = multer({
  storage: chunkStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per chunk
});

// ─── POST upload a single chunk (admin) ───────────────────────────────────────
router.post(
  "/upload-chunk",
  requireAuth,
  chunkUpload.single("chunk"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { uploadId, chunkIndex, totalChunks } = req.body;
      if (!uploadId || chunkIndex === undefined || !totalChunks) {
        return res.status(400).json({ error: "Missing chunk metadata" });
      }
      console.log(`Chunk received: ${parseInt(chunkIndex) + 1}/${totalChunks} for upload ${uploadId}`);
      return res.json({ ok: true, chunkIndex: parseInt(chunkIndex), received: true });
    } catch (err) {
      console.error("Chunk upload error:", err);
      return res.status(500).json({ error: "Chunk upload failed" });
    }
  }
);

// ─── POST assemble chunks into a complete file and process ────────────────────
router.post("/assemble-chunks", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { uploadId, originalName, totalChunks, mimeType } = req.body;
    if (!uploadId || !originalName || !totalChunks) {
      return res.status(400).json({ error: "Missing assembly metadata" });
    }

    const ext = path.extname(originalName).toLowerCase() || ".mp4";
    const finalFilename = `${uuidv4()}${ext}`;
    const worksDir = path.join(__dirname, "../uploads/works");
    const finalPath = path.join(worksDir, finalFilename);

    // Assemble chunks in order via streams to prevent memory leaks/OOM crashes
    const writeStream = fs.createWriteStream(finalPath);
    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(CHUNKS_DIR, `${uploadId}_chunk_${i}`);
      if (!fs.existsSync(chunkPath)) {
        writeStream.end();
        // Clean up partial file
        if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
        return res.status(400).json({ error: `Missing chunk ${i}` });
      }

      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.on("error", reject);
        readStream.on("end", resolve);
        readStream.pipe(writeStream, { end: false });
      });
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      writeStream.end();
    });

    // Clean up chunk files
    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(CHUNKS_DIR, `${uploadId}_chunk_${i}`);
      try { fs.unlinkSync(chunkPath); } catch { }
    }

    const isVideo = (mimeType || "").startsWith("video/");
    const fileStats = fs.statSync(finalPath);

    if (isVideo) {
      const baseFilename = finalFilename.replace(/\.[^/.]+$/, "");
      const hlsOutputDir = path.join(worksDir, "hls", baseFilename);

      const stdFilename = `${baseFilename}_compressed.mp4`;
      const highFilename = `${baseFilename}_high.mp4`;
      const lowFilename = `${baseFilename}_low.mp4`;
      const posterFilename = `${baseFilename}_poster.webp`;
      const hlsMaster = "master.m3u8";

      // Start processing in background
      processVideoPipeline(
        finalPath, worksDir, baseFilename, hlsOutputDir
      ).catch(err => console.error("Background video processing failed:", err));

      return res.json({
        type: "video",
        filename: stdFilename,
        url: `${BASE_URL}/uploads/works/${stdFilename}`,
        srcHigh: `${BASE_URL}/uploads/works/${highFilename}`,
        srcLow: `${BASE_URL}/uploads/works/${lowFilename}`,
        poster: `${BASE_URL}/uploads/works/${posterFilename}`,
        hlsUrl: `${BASE_URL}/uploads/works/hls/${baseFilename}/${hlsMaster}`,
        originalName,
        size: fileStats.size,
        compressedSize: fileStats.size,
      });
    } else {
      return res.json({
        type: "image",
        filename: finalFilename,
        url: `${BASE_URL}/uploads/works/${finalFilename}`,
        originalName,
        size: fileStats.size,
      });
    }
  } catch (err) {
    console.error("Chunk assembly error:", err);
    return res.status(500).json({ error: "Assembly failed" });
  }
});

// ─── POST create new work (admin) ─────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, firstName, lastName, slug, category, year, count,
      tagline, description, heroTagline, services, driveFolder,
      number, featured, image, bgImage, media,
    } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: "name and slug are required" });
    }

    const { db } = await getDb();

    const existing = await db.collection("caseStudies").findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "slug already exists" });
    }

    const doc = {
      name, firstName: firstName || name, lastName: lastName || "",
      slug, category, year, count: count || "01",
      tagline, description, heroTagline,
      services: Array.isArray(services) ? services : (services || "").split(",").map((s: string) => s.trim()),
      driveFolder: driveFolder || "",
      number: number || "00",
      featured: featured === true || featured === "true",
      image: image || "",
      bgImage: bgImage || "",
      media: Array.isArray(media) ? media : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("caseStudies").insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error("Create work error:", err);
    return res.status(500).json({ 
      error: "Failed to create work",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── PUT update work (admin) ──────────────────────────────────────────────────
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db } = await getDb();

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    if (updates.services && !Array.isArray(updates.services)) {
      updates.services = updates.services.split(",").map((s: string) => s.trim());
    }

    const result = await db.collection("caseStudies").findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(result);
  } catch (err) {
    console.error("Update work error:", err);
    return res.status(500).json({ 
      error: "Failed to update work",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── DELETE work (admin) ──────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db } = await getDb();

    const work = await db.collection("caseStudies").findOne({ _id: new ObjectId(id as string) });
    if (!work) return res.status(404).json({ error: "Not found" });

    if (Array.isArray(work.media)) {
      for (const item of work.media) {
        if (item.src && item.src.includes("/uploads/works/")) {
          const filename = item.src.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (item.srcHigh && item.srcHigh.includes("/uploads/works/")) {
          const filename = item.srcHigh.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (item.srcLow && item.srcLow.includes("/uploads/works/")) {
          const filename = item.srcLow.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (item.poster && item.poster.includes("/uploads/works/")) {
          const filename = item.poster.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (item.hlsUrl && item.hlsUrl.includes("/uploads/works/hls/")) {
          const parts = item.hlsUrl.split("/uploads/works/hls/");
          if (parts[1]) {
            const hlsFolder = parts[1].split("/")[0];
            if (hlsFolder) {
              const hlsFolderPath = path.join(__dirname, "../uploads/works/hls", hlsFolder);
              if (fs.existsSync(hlsFolderPath)) {
                fs.rmSync(hlsFolderPath, { recursive: true, force: true });
              }
            }
          }
        }
      }
    }

    await db.collection("caseStudies").deleteOne({ _id: new ObjectId(id as string) });
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete work error:", err);
    return res.status(500).json({ 
      error: "Failed to delete work",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

export default router;
