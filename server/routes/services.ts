import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { getDb } from "../lib/db";
import { getCached, invalidateCache } from "../lib/cache";

const router = Router();
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// ─── GET all services ─────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await getCached("services_all", 60, async () => {
      const { db } = await getDb();
      return db.collection('services').find({}).sort({ number: 1 }).toArray();
    });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(services);
  } catch (err) {
    console.error("Fetch all services error:", err);
    return res.status(500).json({ 
      error: 'Failed to fetch services',
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── GET single service by slug ──────────────────────────────────────────────
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const service = await getCached("services_" + req.params.slug, 60, async () => {
      const { db } = await getDb();
      return db.collection("services").findOne({ slug: req.params.slug });
    });
    if (!service) return res.status(404).json({ error: "Not found" });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(service);
  } catch (err) {
    console.error("Fetch service by slug error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch service",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── POST upload media ────────────────────────────────────────────────────────
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const url = `${BASE_URL}/uploads/services/${req.file.filename}`;
      return res.json({ url, type: req.file.mimetype.startsWith("video/") ? "video" : "image" });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ─── POST create or update service ───────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { _id, slug, title, description, features, mediaUrl, mediaType, number } = req.body;
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    const { db } = await getDb();

    const doc = {
      slug, title, description,
      features: Array.isArray(features) ? features : [],
      mediaUrl, mediaType,
      number: number || "01",
      updatedAt: new Date()
    };

    if (_id) {
      await db.collection("services").updateOne(
        { _id: new ObjectId(_id as string) },
        { $set: doc }
      );
      invalidateCache("services_");
      return res.json({ ...doc, _id });
    } else {
      (doc as any).createdAt = new Date();
      const result = await db.collection("services").insertOne(doc);
      invalidateCache("services_");
      return res.status(201).json({ ...doc, _id: result.insertedId });
    }
  } catch (err) {
    console.error("Save service error:", err);
    return res.status(500).json({ 
      error: "Operation failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// ─── DELETE service ─────────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { db } = await getDb();
    await db.collection("services").deleteOne({ _id: new ObjectId(req.params.id as string) });
    invalidateCache("services_");
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete service error:", err);
    return res.status(500).json({ 
      error: "Delete failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

export default router;
