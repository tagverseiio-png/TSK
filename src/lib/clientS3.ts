const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tsk_admin_token");
}

const region = process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1";
const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "tsk-website";

/**
 * Uploads a file directly to the S3 bucket from the browser using a secure server-generated Presigned URL.
 * Protects AWS Secret Keys from exposure in browser JavaScript.
 */
export async function uploadFileToS3Direct(
  file: File,
  key: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const token = getToken();

  // 1. Get presigned upload URL from backend
  const presignedRes = await fetch(`${API_BASE}/api/storage/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ key, contentType: file.type || "application/octet-stream" }),
  });

  if (!presignedRes.ok) {
    const err = await presignedRes.json().catch(() => ({ error: "Failed to get upload URL" }));
    throw new Error(err.error || "Failed to generate presigned S3 upload URL");
  }

  const { uploadUrl } = await presignedRes.json();

  // 2. Upload file directly to S3 using Presigned URL
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during S3 upload"));
    xhr.send(file);
  });
}

/**
 * Triggers a serverless AWS MediaConvert job securely through the backend.
 */
export async function triggerMediaConvertJob(
  rawS3Key: string,
  baseFilename: string
): Promise<{
  url: string;
  srcHigh: string;
  srcLow: string;
  poster: string;
  hlsUrl: string;
}> {
  const token = getToken();

  const res = await fetch(`${API_BASE}/api/storage/mediaconvert-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ rawS3Key, baseFilename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to dispatch MediaConvert job" }));
    throw new Error(err.error || "MediaConvert dispatch failed");
  }

  return res.json();
}
