import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const admin = await db.collection("adminUsers").findOne({ email });
    await client.close();

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash as string);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id.toString(), email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ token, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
