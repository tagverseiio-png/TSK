import { Router, Request, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import fs from "fs";
import path from "path";
import { listS3Objects, deleteFromS3, getPresignedUploadUrl, dispatchMediaConvertJob } from "../utils/s3";

const router = Router();
const BASE_URL = process.env.SERVER_URL || "http://localhost:4000";

// ─── POST generate presigned S3 upload URL (admin) ──────────────────────────
router.post("/presigned-url", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { key, contentType } = req.body;
    if (!key || typeof key !== "string" || !contentType || typeof contentType !== "string") {
      return res.status(400).json({ error: "key and contentType strings are required" });
    }

    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    return res.json({ uploadUrl });
  } catch (err) {
    console.error("Presigned URL error:", err);
    return res.status(500).json({ error: "Failed to generate presigned upload URL" });
  }
});

// ─── POST dispatch MediaConvert job (admin) ───────────────────────────────────
router.post("/mediaconvert-job", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rawS3Key, baseFilename } = req.body;
    if (!rawS3Key || typeof rawS3Key !== "string" || !baseFilename || typeof baseFilename !== "string") {
      return res.status(400).json({ error: "rawS3Key and baseFilename strings are required" });
    }

    const jobResult = await dispatchMediaConvertJob(rawS3Key, baseFilename);
    return res.json(jobResult);
  } catch (err) {
    console.error("MediaConvert job error:", err);
    return res.status(500).json({ error: "Failed to dispatch MediaConvert job" });
  }
});

interface FileInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  folder: string;
  createdAt: Date;
}

// ─── GET list all uploaded files (admin) ──────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const s3Objects = await listS3Objects("works/"); // Prefix can be adjusted if needed
    
    const files: FileInfo[] = s3Objects.map((obj: any) => {
      const folder = obj.Key?.includes("/") ? path.dirname(obj.Key) : "root";
      return {
        name: path.basename(obj.Key || ""),
        path: obj.Key || "",
        url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
        size: obj.Size || 0,
        folder: folder.replace(/\\/g, "/"),
        createdAt: obj.LastModified || new Date(),
      };
    });

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

    // Since we now use S3, filePath is the S3 Key
    await deleteFromS3(filePath);
    
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete storage file error:", err);
    return res.status(500).json({ error: "Failed to delete storage file" });
  }
});

export default router;
