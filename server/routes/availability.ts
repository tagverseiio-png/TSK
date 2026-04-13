import { Router, Request, Response } from "express";
import { MongoClient } from "mongodb";

const router = Router();
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

// ─── GET locked slots for a given date ───────────────────────────────────────
// Public endpoint — used by the Studio booking form to gray out booked slots
// Query: GET /api/availability?date=2024-06-15
router.get("/", async (req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "date query param required" });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Only "confirmed" bookings lock a slot
    const bookings = await db
      .collection("bookings")
      .find({ date, status: "confirmed" }, { projection: { startTime: 1 } })
      .toArray();

    const lockedSlots = bookings.map((b) => b.startTime as string);
    return res.json({ date, lockedSlots });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch availability" });
  } finally {
    await client?.close();
  }
});

export default router;
