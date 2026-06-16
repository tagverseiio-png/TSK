import { Router, Request, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import fs from "fs";
import path from "path";

const router = Router();
const UPLOADS_DIR = path.join(__dirname, "../uploads");
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

interface FileInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  folder: string;
  createdAt: Date;
}

// Helper to recursively read directory
function getFilesRecursive(dir: string, baseDir: string = dir): FileInfo[] {
  let results: FileInfo[] = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursive(filePath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, filePath); // e.g., 'works/image.png'
      const folder = path.dirname(relativePath);
      const url = `${BASE_URL}/uploads/${relativePath.replace(/\\/g, "/")}`;
      
      results.push({
        name: file,
        path: filePath,
        url,
        size: stat.size,
        folder: folder === "." ? "root" : folder.replace(/\\/g, "/"),
        createdAt: stat.birthtime,
      });
    }
  }
  return results;
}

// ─── GET list all uploaded files (admin) ──────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const files = getFilesRecursive(UPLOADS_DIR);
    // Sort by created desc
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return res.json(files);
  } catch (err) {
    console.error("Fetch storage files error:", err);
    return res.status(500).json({ error: "Failed to fetch storage files" });
  }
});

// ─── DELETE single file from storage (admin) ──────────────────────────────────
router.delete("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: "filePath is required" });

    // Security check: ensure path is inside UPLOADS_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
      return res.status(403).json({ error: "Unauthorized file path" });
    }

    if (fs.existsSync(resolvedPath)) {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
         fs.rmSync(resolvedPath, { recursive: true, force: true });
      } else {
         fs.unlinkSync(resolvedPath);
      }
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete storage file error:", err);
    return res.status(500).json({ error: "Failed to delete storage file" });
  }
});

export default router;
