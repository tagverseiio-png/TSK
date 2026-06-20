import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "tsk-website";

/**
 * Uploads a local file to S3
 */
export async function uploadToS3(localFilePath: string, s3Key: string, mimeType: string): Promise<string> {
  const fileStream = fs.createReadStream(localFilePath);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: mimeType,
      // If the bucket doesn't support ACLs or they are blocked, remove this line.
      // Assuming ACLs are enabled and Object Writer is set based on previous instructions.
      // We will rely on bucket policies or ACLs. If ACL fails, we can remove ACL: 'public-read'
      // ACL: "public-read",
    },
  });

  await upload.done();
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}

/**
 * Uploads all files in a directory to S3
 */
export async function uploadDirectoryToS3(localDirPath: string, s3Prefix: string): Promise<void> {
  const files = fs.readdirSync(localDirPath);
  for (const file of files) {
    const filePath = `${localDirPath}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await uploadDirectoryToS3(filePath, `${s3Prefix}/${file}`);
    } else {
      let mimeType = "application/octet-stream";
      if (file.endsWith(".m3u8")) mimeType = "application/vnd.apple.mpegurl";
      else if (file.endsWith(".ts")) mimeType = "video/mp2t";
      else if (file.endsWith(".mp4")) mimeType = "video/mp4";
      else if (file.endsWith(".webp")) mimeType = "image/webp";

      await uploadToS3(filePath, `${s3Prefix}/${file}`, mimeType);
    }
  }
}

/**
 * Deletes an object from S3
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  await s3Client.send(command);
}

/**
 * Deletes a directory (all objects with a specific prefix) from S3
 */
export async function deleteDirectoryFromS3(prefix: string): Promise<void> {
  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  while (isTruncated) {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(listCommand);

    if (Contents && Contents.length > 0) {
      for (const item of Contents) {
        if (item.Key) {
          await deleteFromS3(item.Key);
        }
      }
    }

    isTruncated = IsTruncated ?? false;
    continuationToken = NextContinuationToken;
  }
}

/**
 * Lists all objects with a specific prefix
 */
export async function listS3Objects(prefix: string) {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const { Contents } = await s3Client.send(listCommand);
  return Contents || [];
}
