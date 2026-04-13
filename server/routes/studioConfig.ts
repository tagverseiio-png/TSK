import { Router, Request, Response } from "express";
import { MongoClient } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

// ─── GET studio config (public) ───────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const config = await db.collection("studioConfig").findOne({});
    return res.json(config || {});
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch config" });
  } finally {
    await client?.close();
  }
});

// ─── PUT update studio config (admin) ────────────────────────────────────────
router.put("/", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    await db.collection("studioConfig").updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    const updated = await db.collection("studioConfig").findOne({});
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update config" });
  } finally {
    await client?.close();
  }
});

export default router;
