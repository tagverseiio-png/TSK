import fs from "fs";
import path from "path";

const API_BASE = "https://tskapi.t4gverse.com";
const FILE_PATH = "/Users/user/Downloads/Goa_Special.mov";
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

async function runTest() {
  console.log("1. Logging in...");
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@tsk.com", password: "tsk@admin2024" }),
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    return;
  }
  const { token } = await loginRes.json();
  console.log("Logged in, got token.");

  console.log("2. Stat file:", FILE_PATH);
  const stats = fs.statSync(FILE_PATH);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  const totalChunks = Math.ceil(stats.size / CHUNK_SIZE);
  const uploadId = `test-${Date.now()}`;
  const fileName = path.basename(FILE_PATH);

  console.log(`Total chunks to upload: ${totalChunks}`);

  // We have to use FormData, but since we're in Node, we can use built-in FormData with Blob
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, stats.size);
    
    // Read chunk
    const buffer = Buffer.alloc(end - start);
    const fd = fs.openSync(FILE_PATH, "r");
    fs.readSync(fd, buffer, 0, buffer.length, start);
    fs.closeSync(fd);

    const blob = new Blob([buffer], { type: "video/quicktime" });
    const formData = new FormData();
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", String(i));
    formData.append("totalChunks", String(totalChunks));
    formData.append("originalName", fileName);
    formData.append("fileSize", String(stats.size));
    formData.append("mimeType", "video/quicktime");
    formData.append("chunk", blob, fileName);

    console.log(`Uploading chunk ${i + 1}/${totalChunks}...`);
    const chunkRes = await fetch(`${API_BASE}/api/works/upload-chunk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!chunkRes.ok) {
      console.error(`Chunk ${i + 1} failed: ${chunkRes.status} ${chunkRes.statusText}`);
      console.error(await chunkRes.text());
      return;
    }
    console.log(`Chunk ${i + 1} OK.`);
  }

  console.log("3. Assembling chunks...");
  const assembleRes = await fetch(`${API_BASE}/api/works/assemble-chunks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      uploadId,
      originalName: fileName,
      totalChunks,
      mimeType: "video/quicktime",
    }),
  });

  if (!assembleRes.ok) {
    console.error(`Assembly failed: ${assembleRes.status} ${assembleRes.statusText}`);
    console.error(await assembleRes.text());
    return;
  }

  const result = await assembleRes.json();
  console.log("Upload assembled successfully:", result);
}

runTest().catch(console.error);
