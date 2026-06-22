import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    } as any);
  }
  return s3ClientInstance;
}

function getBucketName(): string {
  return process.env.AWS_S3_BUCKET || "tsk-website";
}

/**
 * Uploads a local file to S3
 */
export async function uploadToS3(localFilePath: string, s3Key: string, mimeType: string): Promise<string> {
  const fileStream = fs.createReadStream(localFilePath);
  const client = getS3Client();
  const bucketName = getBucketName();

  const upload = new Upload({
    client,
    params: {
      Bucket: bucketName,
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
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
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
  const client = getS3Client();
  const bucketName = getBucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });
  await client.send(command);
}

/**
 * Deletes a directory (all objects with a specific prefix) from S3
 */
export async function deleteDirectoryFromS3(prefix: string): Promise<void> {
  const client = getS3Client();
  const bucketName = getBucketName();

  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  while (isTruncated) {
    const listCommand: any = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const { Contents, IsTruncated, NextContinuationToken } = (await client.send(listCommand)) as any;

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
  const client = getS3Client();
  const bucketName = getBucketName();

  const listCommand: any = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const { Contents } = (await client.send(listCommand)) as any;
  return Contents || [];
}
