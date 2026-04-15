import { Router, Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const router = Router();
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "TSK";
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// Helper to get DB client
async function getDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}

// ─── GET all works (public) ───────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { client: c, db } = await getDb();
    client = c;
    const works = await db.collection("caseStudies").find({}).sort({ number: 1 }).toArray();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.json(works);
  } catch (err) {
    console.error("Fetch all works error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch works",
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
  }
});

// ─── GET single work by slug (public) ────────────────────────────────────────
router.get("/:slug", async (req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { client: c, db } = await getDb();
    client = c;
    const work = await db.collection("caseStudies").findOne({ slug: req.params.slug });
    if (!work) return res.status(404).json({ error: "Not found" });
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.json(work);
  } catch (err) {
    console.error("Fetch work by slug error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch work",
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
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

      const results = await Promise.all(
        files.map(async (f) => {
          const isVideo = f.mimetype.startsWith("video/");
          let finalFilename = f.filename;
          
          if (isVideo) {
            finalFilename = `${f.filename.replace(/\.[^/.]+$/, "")}_compressed.mp4`;
            const inputPath = path.join(__dirname, "../uploads/works", f.filename);
            const outputPath = path.join(__dirname, "../uploads/works", finalFilename);

            await new Promise((resolve, reject) => {
              ffmpeg(inputPath)
                .videoFilters("scale='min(1920,iw)':-2")
                .outputOptions([
                  "-c:v libx264",
                  "-preset fast",
                  "-crf 23",
                  "-maxrate 2500k",
                  "-bufsize 5000k",
                  "-c:a aac",
                  "-b:a 128k",
                  "-movflags +faststart" 
                ])
                .toFormat("mp4")
                .on("end", () => {
                  if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                  resolve(true);
                })
                .on("error", (err) => {
                  console.error("FFmpeg compression error:", err);
                  reject(err);
                })
                .save(outputPath);
            });
          }

          return {
            type: isVideo ? "video" : "image",
            filename: finalFilename,
            url: `${BASE_URL}/uploads/works/${finalFilename}`,
            originalName: f.originalname,
            size: f.size,
          };
        })
      );

      return res.json(results);
    } catch (err) {
      console.error("Upload works media error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ─── POST create new work (admin) ─────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const {
      name, firstName, lastName, slug, category, year, count,
      tagline, description, heroTagline, services, driveFolder,
      number, featured, image, bgImage, media,
    } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: "name and slug are required" });
    }

    const { client: c, db } = await getDb();
    client = c;

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
  } finally {
    await client?.close();
  }
});

// ─── PUT update work (admin) ──────────────────────────────────────────────────
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { id } = req.params;
    const { client: c, db } = await getDb();
    client = c;

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
  } finally {
    await client?.close();
  }
});

// ─── DELETE work (admin) ──────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { id } = req.params;
    const { client: c, db } = await getDb();
    client = c;

    const work = await db.collection("caseStudies").findOne({ _id: new ObjectId(id as string) });
    if (!work) return res.status(404).json({ error: "Not found" });

    if (Array.isArray(work.media)) {
      for (const item of work.media) {
        if (item.src && item.src.includes("/uploads/works/")) {
          const filename = item.src.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (item.poster && item.poster.includes("/uploads/works/")) {
          const filename = item.poster.split("/uploads/works/")[1];
          const filePath = path.join(__dirname, "../uploads/works", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
  } finally {
    await client?.close();
  }
});

export default router;
