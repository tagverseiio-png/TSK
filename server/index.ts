import express from "express";
import cors from "cors";
import path from "path";
import compression from "compression";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import authRoutes from "./routes/auth";
import worksRoutes from "./routes/works";
import bookingsRoutes from "./routes/bookings";
import studioConfigRoutes from "./routes/studioConfig";
import availabilityRoutes from "./routes/availability";

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
      process.env.FRONTEND_URL || "https://tsk-alpha.vercel.app", // Fallback incase env parsing fails
    ],
    credentials: true,
  })
);

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Static media files ───────────────────────────────────────────────────────
// Serve uploaded images/videos at http://localhost:4000/uploads/...
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: 31536000000, // 1 year caching for videos/images
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(mp4|webm|mov|avi)$/i)) {
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", "video/mp4");
      }
    },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/works", worksRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/studio-config", studioConfigRoutes);
app.use("/api/availability", availabilityRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TSK API Server running on http://localhost:${PORT}`);
  console.log(`   📁 Uploads served at http://localhost:${PORT}/uploads/`);
  console.log(`   🔐 Admin: /api/auth/login`);
  console.log(`   🎬 Works: /api/works`);
  console.log(`   📅 Bookings: /api/bookings\n`);
});

export default app;
