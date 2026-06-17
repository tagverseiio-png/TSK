import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import path from "path";
import fs from "fs";
import { getDb } from "../lib/db";
import { getCached, invalidateCache } from "../lib/cache";

const router = Router();
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// ─── GET all clients (public) ──────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const clients = await getCached("clients_all", 300, async () => {
      const { db } = await getDb();
      return db.collection("clients").find({}).sort({ order: 1, createdAt: -1 }).toArray();
    });
    
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(clients);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch clients" });
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
  try {
    const { name, logo, order } = req.body;
    if (!name || !logo) {
      return res.status(400).json({ error: "Name and logo are required" });
    }

    const { db } = await getDb();

    const doc = {
      name,
      logo,
      order: order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("clients").insertOne(doc);
    invalidateCache("clients_");
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create client" });
  }
});

// ─── PUT update client (admin) ───────────────────────────────────────────────
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db } = await getDb();

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    const result = await db.collection("clients").findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Not found" });
    invalidateCache("clients_");
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update client" });
  }
});

// ─── DELETE client (admin) ───────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db } = await getDb();

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
    invalidateCache("clients_");
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
