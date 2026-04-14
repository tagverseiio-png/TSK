import { Router, Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import path from "path";
import fs from "fs";

const router = Router();
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// ─── GET all clients (public) ──────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const clients = await db.collection("clients").find({}).sort({ order: 1, createdAt: -1 }).toArray();
    return res.json(clients);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch clients" });
  } finally {
    await client?.close();
  }
});

// ─── POST upload logo (admin) ────────────────────────────────────────────────
router.post(
  "/upload-logo",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      return res.json({
        url: `${BASE_URL}/uploads/clients/${req.file.filename}`,
        filename: req.file.filename,
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ─── POST create client (admin) ──────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { name, logo, order } = req.body;
    if (!name || !logo) {
      return res.status(400).json({ error: "Name and logo are required" });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const doc = {
      name,
      logo,
      order: order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("clients").insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create client" });
  } finally {
    await client?.close();
  }
});

// ─── PUT update client (admin) ───────────────────────────────────────────────
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { id } = req.params;
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    const result = await db.collection("clients").findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update client" });
  } finally {
    await client?.close();
  }
});

// ─── DELETE client (admin) ───────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { id } = req.params;
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Get client to delete physical file
    const clientDoc = await db.collection("clients").findOne({ _id: new ObjectId(id as string) });
    if (clientDoc && clientDoc.logo) {
      const filename = clientDoc.logo.split("/uploads/clients/")[1];
      if (filename) {
        const filePath = path.join(__dirname, "../uploads/clients", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await db.collection("clients").deleteOne({ _id: new ObjectId(id as string) });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete client" });
  } finally {
    await client?.close();
  }
});

export default router;
