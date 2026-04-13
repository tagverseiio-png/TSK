import { Router, Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

// ─── GET all bookings (admin) ─────────────────────────────────────────────────
router.get("/", requireAuth, async (_req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const bookings = await db
      .collection("bookings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookings" });
  } finally {
    await client?.close();
  }
});

// ─── PATCH confirm / reject / update status (admin) ──────────────────────────
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const result = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Booking not found" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update status" });
  } finally {
    await client?.close();
  }
});

// ─── DELETE booking (admin) ───────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id as string) });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete booking" });
  } finally {
    await client?.close();
  }
});

// ─── POST create booking (public — called by BookingForm) ────────────────────
router.post("/", async (req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const booking = {
      ...req.body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);
    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save booking" });
  } finally {
    await client?.close();
  }
});

export default router;
