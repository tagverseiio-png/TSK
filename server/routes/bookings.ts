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
    const {
      // Studio booking fields (from BookingForm.tsx)
      name, phone, date, startTime, duration,
      videoCoverage, reelsNoSubs, reelsWithSubs, fullPodcast, totalPrice,
      // Generic contact fields (optional, for other booking forms)
      email, company, service, budget, time, location, notes, details
    } = req.body || {};

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required" });
    }

    // Require at least phone OR email as contact
    if (!phone && !email) {
      return res.status(400).json({ error: "Phone or Email is required" });
    }

    const { db } = await getDb();

    const sanitizeStr = (val: any) => (typeof val === "string" ? val.trim().slice(0, 1000) : "");
    const sanitizeNum = (val: any) => (typeof val === "number" ? val : (parseFloat(val) || 0));
    const sanitizeBool = (val: any) => !!val;

    const booking = {
      name: sanitizeStr(name),
      phone: sanitizeStr(phone),
      email: sanitizeStr(email).toLowerCase(),
      // Studio-specific fields
      date: sanitizeStr(date),
      startTime: sanitizeStr(startTime),
      duration: sanitizeNum(duration),
      videoCoverage: sanitizeBool(videoCoverage),
      reelsNoSubs: sanitizeNum(reelsNoSubs),
      reelsWithSubs: sanitizeNum(reelsWithSubs),
      fullPodcast: sanitizeNum(fullPodcast),
      totalPrice: sanitizeNum(totalPrice),
      // Generic fields
      company: sanitizeStr(company),
      service: sanitizeStr(service),
      budget: sanitizeStr(budget),
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
    console.error("Create booking error:", err);
    return res.status(500).json({ error: "Failed to save booking" });
  }
});

export default router;
