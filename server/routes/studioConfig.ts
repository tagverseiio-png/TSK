import { Router, Request, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { getDb } from "../lib/db";

const router = Router();

// ─── GET studio config (public) ───────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { db } = await getDb();
    const config = await db.collection("studioConfig").findOne({});
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(config || {});
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch config" });
  }
});

// ─── PUT update studio config (admin) ────────────────────────────────────────
router.put("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { db } = await getDb();

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
  }
});

export default router;
