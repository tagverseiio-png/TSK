import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// Load environment variables
dotenv.config({ path: ".env.local" });

const API_BASE = process.env.SERVER_URL || "http://localhost:4000";
const JWT_SECRET = process.env.JWT_SECRET || "tsk_super_secret_2024";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "TSK";

async function runTests() {
  console.log("=========================================");
  console.log("     MEDIA PIPELINE INTEGRATION TESTS    ");
  console.log("=========================================");

  // 1. Generate Auth Token
  console.log("\n[1] Generating test JWT token...");
  const token = jwt.sign({ id: "test-admin-id" }, JWT_SECRET);
  console.log("Token generated successfully.");

  // 2. Generate a 1-second test video file using fluent-ffmpeg installer paths
  console.log("\n[2] Creating 1-second blank test video...");
  const testInputPath = path.join(__dirname, "test-input.mp4");
  const ffmpegPath = ffmpegInstaller.path;
  
  try {
    execSync(`"${ffmpegPath}" -y -f lavfi -i color=c=blue:s=320x240:d=1 -t 1 "${testInputPath}"`, { stdio: "ignore" });
    console.log(`Test video created at: ${testInputPath}`);
  } catch (err) {
    console.error("Failed to generate test video with FFmpeg:", err);
    process.exit(1);
  }

  // 3. Upload video to API endpoint
  console.log("\n[3] Uploading video to /api/works/upload-media...");
  let uploadResult: any = null;
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testInputPath);
    const fileBlob = new Blob([fileBuffer], { type: "video/mp4" });
    formData.append("files", fileBlob, "test-input.mp4");

    const res = await fetch(`${API_BASE}/api/works/upload-media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload failed (${res.status}): ${errText}`);
    }

    const json = await res.json() as any[];
    uploadResult = json[0];
    console.log("Upload response received successfully:");
    console.log(JSON.stringify(uploadResult, null, 2));

    // Assert responses
    if (!uploadResult.url || !uploadResult.srcHigh || !uploadResult.srcLow || !uploadResult.poster || !uploadResult.hlsUrl) {
      throw new Error("Missing video optimization variants in response.");
    }
    console.log("✔ Upload payload contains all required URLs.");
  } catch (err) {
    console.error("FAIL: Upload test failed:", err);
    cleanupLocalFile(testInputPath);
    process.exit(1);
  }

  // Clean up input video
  cleanupLocalFile(testInputPath);

  // 4. Verify files exist on disk
  console.log("\n[4] Verifying generated files exist on the server...");
  const uploadsDir = path.join(__dirname, "../server/uploads/works");
  const hlsBaseDir = path.join(uploadsDir, "hls");

  const stdFile = path.join(uploadsDir, uploadResult.filename);
  const highFile = path.join(uploadsDir, uploadResult.srcHigh.split("/uploads/works/")[1]);
  const lowFile = path.join(uploadsDir, uploadResult.srcLow.split("/uploads/works/")[1]);
  const posterFile = path.join(uploadsDir, uploadResult.poster.split("/uploads/works/")[1]);

  const hlsFolder = uploadResult.hlsUrl.split("/uploads/works/hls/")[1].split("/")[0];
  const hlsDir = path.join(hlsBaseDir, hlsFolder);
  const hlsMaster = path.join(hlsDir, "master.m3u8");
  const hls720 = path.join(hlsDir, "720p.m3u8");
  const hls480 = path.join(hlsDir, "480p.m3u8");

  assertFileExists(stdFile, "Standard MP4");
  assertFileExists(highFile, "High Variant MP4");
  assertFileExists(lowFile, "Low Variant MP4");
  assertFileExists(posterFile, "Poster WebP");
  assertFileExists(hlsMaster, "HLS Master Playlist");
  assertFileExists(hls720, "HLS 720p Playlist");
  assertFileExists(hls480, "HLS 480p Playlist");
  console.log("✔ All files successfully verified on the server storage.");

  // 5. Verify static serving headers (MIME types)
  console.log("\n[5] Verifying Static File Serving HTTP headers...");
  try {
    // 5.1 HLS playlist (.m3u8)
    const masterRes = await fetch(uploadResult.hlsUrl);
    const masterType = masterRes.headers.get("Content-Type");
    const masterCache = masterRes.headers.get("Cache-Control");
    console.log(`HLS master playlist Content-Type: ${masterType}`);
    console.log(`HLS master playlist Cache-Control: ${masterCache}`);
    if (masterType !== "application/vnd.apple.mpegurl") {
      throw new Error(`Expected MIME 'application/vnd.apple.mpegurl', got '${masterType}'`);
    }
    if (masterCache !== "no-cache") {
      throw new Error(`Expected Cache-Control 'no-cache', got '${masterCache}'`);
    }

    // 5.2 TS segment file (e.g. 720p_000.ts)
    const tsUrl = uploadResult.hlsUrl.replace("master.m3u8", "720p_000.ts");
    const tsRes = await fetch(tsUrl);
    const tsType = tsRes.headers.get("Content-Type");
    console.log(`HLS segment (.ts) Content-Type: ${tsType}`);
    if (tsType !== "video/mp2t") {
      throw new Error(`Expected MIME 'video/mp2t', got '${tsType}'`);
    }

    // 5.3 MP4 file
    const mp4Res = await fetch(uploadResult.url);
    const mp4Type = mp4Res.headers.get("Content-Type");
    const mp4AcceptRanges = mp4Res.headers.get("Accept-Ranges");
    console.log(`MP4 Content-Type: ${mp4Type}`);
    console.log(`MP4 Accept-Ranges: ${mp4AcceptRanges}`);
    if (mp4Type !== "video/mp4") {
      throw new Error(`Expected MIME 'video/mp4', got '${mp4Type}'`);
    }
    if (mp4AcceptRanges !== "bytes") {
      throw new Error(`Expected Accept-Ranges 'bytes', got '${mp4AcceptRanges}'`);
    }

    console.log("✔ HTTP headers verified successfully.");
  } catch (err) {
    console.error("FAIL: MIME type or headers check failed:", err);
    process.exit(1);
  }

  // 6. Test Deletion and Folder Cleanup
  console.log("\n[6] Testing database record linkage and folder cleanup on delete...");
  const mongoClient = new MongoClient(MONGODB_URI);
  try {
    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DB);

    // Create a mock Case Study document
    console.log("Inserting mock Case Study document...");
    const mockWork = {
      name: "Test Pipeline Case Study",
      slug: "test-pipeline-case-study",
      category: "Creative Direction",
      year: "2026",
      media: [
        {
          type: "video",
          src: uploadResult.url,
          srcHigh: uploadResult.srcHigh,
          srcLow: uploadResult.srcLow,
          poster: uploadResult.poster,
          hlsUrl: uploadResult.hlsUrl,
          caption: "Test case study video pipeline"
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertRes = await db.collection("caseStudies").insertOne(mockWork);
    const workId = insertRes.insertedId.toString();
    console.log(`Mock Case Study inserted with ID: ${workId}`);

    // Call DELETE API on mock work
    console.log(`Sending DELETE request to /api/works/${workId}...`);
    const delRes = await fetch(`${API_BASE}/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!delRes.ok) {
      throw new Error(`DELETE request failed with status: ${delRes.status}`);
    }
    console.log("DELETE endpoint responded with success.");

    // Verify files are deleted from server storage
    console.log("Checking if files were cleaned up from disk...");
    assertFileDeleted(stdFile, "Standard MP4");
    assertFileDeleted(highFile, "High Variant MP4");
    assertFileDeleted(lowFile, "Low Variant MP4");
    assertFileDeleted(posterFile, "Poster WebP");
    assertFileDeleted(hlsMaster, "HLS Master Playlist");
    assertFileDeleted(hlsDir, "HLS Chunk Directory");

    console.log("✔ Disk cleanups verified successfully.");
  } catch (err) {
    console.error("FAIL: Deletion cleanup test failed:", err);
    process.exit(1);
  } finally {
    await mongoClient.close();
  }

  console.log("\n=========================================");
  console.log("   ALL INTEGRATION TESTS PASSED (100%)   ");
  console.log("=========================================");
}

function assertFileExists(filePath: string, label: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing expected file on disk for ${label}: ${filePath}`);
  }
  console.log(`  - ${label} exists on disk.`);
}

function assertFileDeleted(filePath: string, label: string) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File was NOT cleaned up for ${label}: ${filePath}`);
  }
  console.log(`  - ${label} was deleted from disk.`);
}

function cleanupLocalFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

runTests();
