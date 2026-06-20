import { getDb } from "../server/lib/db";
import { uploadToS3, uploadDirectoryToS3 } from "../server/utils/s3";
import { processVideoPipeline } from "../server/utils/videoProcessor";
import fs from "fs";
import path from "path";
import https from "https";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config({ path: envPath });
}

async function downloadDriveFile(id: string, destPath: string): Promise<void> {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  const res1 = await fetch(downloadUrl, { redirect: "manual" });
  let finalUrl = downloadUrl;
  let cookieStr = "";
  if (res1.status === 303 || res1.status === 302) {
    const loc = res1.headers.get("location");
    cookieStr = res1.headers.get("set-cookie") || "";
    if (loc) {
      const res2 = await fetch(loc, { headers: { Cookie: cookieStr } });
      const contentType = res2.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const text = await res2.text();
        const uuidMatch = text.match(/name="uuid" value="([^"]+)"/);
        if (uuidMatch) {
          finalUrl = `${loc}&confirm=t&uuid=${uuidMatch[1]}`;
        }
      } else {
        finalUrl = loc;
      }
    }
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const headers: any = {};
    if (cookieStr) headers.Cookie = cookieStr;

    https.get(finalUrl, { headers }, (response) => {
      if (response.statusCode && response.statusCode >= 300) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function migrate() {
  console.log("Starting S3 Migration...");
  const { db } = await getDb();

  // 1. Migrate Clients
  console.log("Migrating Clients...");
  const clients = await db.collection("clients").find({}).toArray();
  for (const client of clients) {
    if (client.logo && client.logo.includes("/uploads/clients/")) {
      const filename = client.logo.split("/uploads/clients/")[1];
      const localPath = path.join(__dirname, "../server/uploads/clients", filename);
      if (fs.existsSync(localPath)) {
        console.log(`Uploading client logo: ${filename}`);
        const s3Url = await uploadToS3(localPath, `clients/${filename}`, "image/png"); // Defaulting to png, doesn't matter too much for S3 if it's correct format
        await db.collection("clients").updateOne({ _id: client._id }, { $set: { logo: s3Url } });
      }
    }
  }

  // 2. Migrate Services
  console.log("Migrating Services...");
  const services = await db.collection("services").find({}).toArray();
  for (const service of services) {
    if (service.mediaUrl && service.mediaUrl.includes("/uploads/services/")) {
      const filename = service.mediaUrl.split("/uploads/services/")[1];
      const localPath = path.join(__dirname, "../server/uploads/services", filename);
      if (fs.existsSync(localPath)) {
        console.log(`Uploading service media: ${filename}`);
        const s3Url = await uploadToS3(localPath, `services/${filename}`, service.mediaType === "video" ? "video/mp4" : "image/png");
        await db.collection("services").updateOne({ _id: service._id }, { $set: { mediaUrl: s3Url } });
      }
    }
  }

  // 3. Migrate Case Studies
  console.log("Migrating Case Studies...");
  const caseStudies = await db.collection("caseStudies").find({}).toArray();
  for (const study of caseStudies) {
    let updatedMedia = false;
    const mediaList = Array.isArray(study.media) ? [...study.media] : [];
    
    for (let i = 0; i < mediaList.length; i++) {
      const item = mediaList[i];
      if (!item.src) continue;

      // Local file
      if (item.src.includes("/uploads/works/")) {
        console.log(`Migrating local file for ${study.slug}...`);
        const filename = item.src.split("/uploads/works/")[1];
        const baseFilename = filename.replace(/\.(mp4|webp)$/, "").replace(/_compressed|_high|_low|_poster/, "");
        const outputDir = path.join(__dirname, "../server/uploads/works");
        const hlsOutputDir = path.join(outputDir, "hls", baseFilename);

        const standard = `${baseFilename}_compressed.mp4`;
        const high = `${baseFilename}_high.mp4`;
        const low = `${baseFilename}_low.mp4`;
        const poster = `${baseFilename}_poster.webp`;

        try {
          if (fs.existsSync(path.join(outputDir, standard))) await uploadToS3(path.join(outputDir, standard), `works/${standard}`, "video/mp4");
          if (fs.existsSync(path.join(outputDir, high))) await uploadToS3(path.join(outputDir, high), `works/${high}`, "video/mp4");
          if (fs.existsSync(path.join(outputDir, low))) await uploadToS3(path.join(outputDir, low), `works/${low}`, "video/mp4");
          if (fs.existsSync(path.join(outputDir, poster))) await uploadToS3(path.join(outputDir, poster), `works/${poster}`, "image/webp");
          if (fs.existsSync(hlsOutputDir)) await uploadDirectoryToS3(hlsOutputDir, `works/hls/${baseFilename}`);

          item.src = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${standard}`;
          item.srcHigh = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${high}`;
          item.srcLow = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${low}`;
          item.poster = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${poster}`;
          item.hlsUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/hls/${baseFilename}/master.m3u8`;
          updatedMedia = true;
        } catch (err) {
          console.error("Failed to upload local files for", baseFilename, err);
        }
      }
      // Google Drive file
      else if (!item.src.startsWith("http") && !item.src.startsWith("/") && !item.src.includes(".")) {
        console.log(`Migrating Google Drive file ${item.src} for ${study.slug}...`);
        const tempPath = path.join(__dirname, `../server/uploads/works/temp_${item.src}.mp4`);
        const outputDir = path.join(__dirname, "../server/uploads/works");
        const hlsOutputDir = path.join(outputDir, "hls", item.src);

        try {
          console.log(`Downloading ${item.src} from Google Drive...`);
          await downloadDriveFile(item.src, tempPath);
          console.log(`Processing video pipeline for ${item.src}...`);
          const result = await processVideoPipeline(tempPath, outputDir, item.src, hlsOutputDir);
          
          console.log(`Uploading generated files to S3 for ${item.src}...`);
          const { standard, high, low, poster } = result;

          await uploadToS3(path.join(outputDir, standard), `works/${standard}`, "video/mp4");
          await uploadToS3(path.join(outputDir, high), `works/${high}`, "video/mp4");
          await uploadToS3(path.join(outputDir, low), `works/${low}`, "video/mp4");
          await uploadToS3(path.join(outputDir, poster), `works/${poster}`, "image/webp");
          await uploadDirectoryToS3(hlsOutputDir, `works/hls/${item.src}`);

          // Clean up local
          const filesToDelete = [standard, high, low, poster];
          for (const file of filesToDelete) {
            const filePath = path.join(outputDir, file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
          if (fs.existsSync(hlsOutputDir)) fs.rmSync(hlsOutputDir, { recursive: true, force: true });
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

          // Update item
          item.src = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${standard}`;
          item.srcHigh = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${high}`;
          item.srcLow = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${low}`;
          item.poster = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/${poster}`;
          item.hlsUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/hls/${item.src}/master.m3u8`;
          updatedMedia = true;
        } catch (err) {
          console.error(`Failed to process Google Drive file ${item.src}`, err);
        }
      }
    }

    if (updatedMedia) {
      console.log(`Saving updated media array for ${study.slug}...`);
      await db.collection("caseStudies").updateOne({ _id: study._id }, { $set: { media: mediaList } });
    }
  }

  console.log("Migration Complete!");
  process.exit(0);
}

migrate().catch(console.error);
