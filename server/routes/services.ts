import { Router, Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";

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

// ─── GET all services ─────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { client: c, db } = await getDb();
    client = c;
    const services = await db.collection('services').find({}).sort({ number: 1 }).toArray();
    return res.json(services);
  } catch (err) {
    console.error("Fetch all services error:", err);
    return res.status(500).json({ 
      error: 'Failed to fetch services',
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
  }
});

// ─── GET single service by slug ──────────────────────────────────────────────
router.get("/:slug", async (req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { client: c, db } = await getDb();
    client = c;
    const service = await db.collection("services").findOne({ slug: req.params.slug });
    if (!service) return res.status(404).json({ error: "Not found" });
    return res.json(service);
  } catch (err) {
    console.error("Fetch service by slug error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch service",
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
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
  let client: MongoClient | null = null;
  try {
    const { _id, slug, title, description, features, mediaUrl, mediaType, number } = req.body;
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    const { client: c, db } = await getDb();
    client = c;

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
      return res.json({ ...doc, _id });
    } else {
      (doc as any).createdAt = new Date();
      const result = await db.collection("services").insertOne(doc);
      return res.status(201).json({ ...doc, _id: result.insertedId });
    }
  } catch (err) {
    console.error("Save service error:", err);
    return res.status(500).json({ 
      error: "Operation failed",
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
  }
});

// ─── DELETE service ─────────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { client: c, db } = await getDb();
    client = c;
    await db.collection("services").deleteOne({ _id: new ObjectId(req.params.id as string) });
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete service error:", err);
    return res.status(500).json({ 
      error: "Delete failed",
      details: err instanceof Error ? err.message : String(err)
    });
  } finally {
    await client?.close();
  }
});

export default router;
