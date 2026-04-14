import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure uploads directories exist
const WORKS_DIR = path.join(__dirname, "../uploads/works");
const CLIENTS_DIR = path.join(__dirname, "../uploads/clients");
const SERVICES_DIR = path.join(__dirname, "../uploads/services");

[WORKS_DIR, CLIENTS_DIR, SERVICES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const xFolder = req.headers['x-upload-folder'];
    let folder = WORKS_DIR;
    if (xFolder === 'clients') folder = CLIENTS_DIR;
    else if (xFolder === 'services') folder = SERVICES_DIR;
    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});
