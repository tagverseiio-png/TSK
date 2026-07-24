import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { getDb } from "../lib/db";

const router = Router();

// ─── GET all bookings (admin) ─────────────────────────────────────────────────
router.get("/", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const { db } = await getDb();
    const bookings = await db
      .collection("bookings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ─── PATCH confirm / reject / update status (admin) ──────────────────────────
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { db } = await getDb();

    const result = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Booking not found" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// ─── DELETE booking (admin) ───────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { db } = await getDb();
    await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id as string) });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete booking" });
  }
});

// ─── POST create booking (public — called by BookingForm) ────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company, service, budget, date, time, location, notes, details } = req.body || {};

    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
      return res.status(400).json({ error: "Name and Email are required fields" });
    }

    const { db } = await getDb();

    const sanitizeStr = (val: any) => (typeof val === "string" ? val.trim().slice(0, 1000) : "");

    const booking = {
      name: sanitizeStr(name),
      email: sanitizeStr(email).toLowerCase(),
      phone: sanitizeStr(phone),
      company: sanitizeStr(company),
      service: sanitizeStr(service),
      budget: sanitizeStr(budget),
      date: sanitizeStr(date),
      time: sanitizeStr(time),
      location: sanitizeStr(location),
      notes: sanitizeStr(notes),
      details: typeof details === "object" && details !== null ? details : {},
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);
    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save booking" });
  }
});

export default router;
