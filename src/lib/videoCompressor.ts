/**
 * Chunked Upload Utility
 * 
 * Splits large files into chunks under 90MB each, uploads them
 * individually, and the server reassembles them. This bypasses
 * Cloudflare's 100MB per-request limit without needing client-side
 * video compression (which is unreliable in browsers).
 */

const CHUNK_SIZE = 90 * 1024 * 1024; // 90MB per chunk (safe margin under 100MB)

export interface ChunkedUploadProgress {
  stage: "uploading" | "processing" | "done";
  percent: number;
  chunkIndex?: number;
  totalChunks?: number;
}

/**
 * Check if a file needs chunked upload (over 90MB).
 */
export function needsChunkedUpload(file: File): boolean {
  return file.size > CHUNK_SIZE;
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Upload a single large file in chunks.
 * Returns the same shape as regular upload results.
 */
export function uploadFileChunked(
  file: File,
  token: string | null,
  apiBase: string,
  onProgress?: (progress: ChunkedUploadProgress) => void
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    onProgress?.({ stage: "uploading", percent: 0, chunkIndex: 0, totalChunks });

    try {
      // Upload each chunk
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk, file.name);
        formData.append("uploadId", uploadId);
        formData.append("chunkIndex", String(i));
        formData.append("totalChunks", String(totalChunks));
        formData.append("originalName", file.name);
        formData.append("fileSize", String(file.size));
        formData.append("mimeType", file.type);

        await new Promise((res, rej) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const chunkProgress = e.loaded / e.total;
              const overallPercent = Math.round(((i + chunkProgress) / totalChunks) * 80); // 0-80%
              onProgress?.({
                stage: "uploading",
                percent: overallPercent,
                chunkIndex: i + 1,
                totalChunks,
              });
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) res(xhr.responseText);
            else rej(new Error(`Chunk ${i + 1}/${totalChunks} upload failed (${xhr.status})`));
          };
          xhr.onerror = () => rej(new Error(`Chunk ${i + 1}/${totalChunks} network error`));
          
          xhr.open("POST", `${apiBase}/api/works/upload-chunk`);
          if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.send(formData);
        });
      }

      // All chunks uploaded — tell server to assemble and process
      onProgress?.({ stage: "processing", percent: 85 });

      const assembleResp = await fetch(`${apiBase}/api/works/assemble-chunks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          uploadId,
          originalName: file.name,
          totalChunks,
          mimeType: file.type,
        }),
      });

      if (!assembleResp.ok) {
        const errText = await assembleResp.text();
        throw new Error(`Assembly failed (${assembleResp.status}): ${errText}`);
      }

      onProgress?.({ stage: "done", percent: 100 });
      const result = await assembleResp.json();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
