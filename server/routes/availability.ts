import { Router, Request, Response } from "express";
import { getDb } from "../lib/db";

const router = Router();

// ─── GET locked slots for a given date ───────────────────────────────────────
// Public endpoint — used by the Studio booking form to gray out booked slots
// Query: GET /api/availability?date=2024-06-15
router.get("/", async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "date query param required" });
    }

    const { db } = await getDb();

    // Only "confirmed" bookings lock a slot
    const bookings = await db
      .collection("bookings")
      .find({ date, status: "confirmed" }, { projection: { startTime: 1 } })
      .toArray();

    const lockedSlots = bookings.map((b) => b.startTime as string);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return res.json({ date, lockedSlots });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router;
