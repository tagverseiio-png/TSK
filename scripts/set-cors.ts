import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function setCors() {
  const bucketName = process.env.AWS_S3_BUCKET || "tsk-website";
  console.log(`Setting CORS for bucket: ${bucketName}`);
  
  const command = new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["ETag", "Content-Length", "Content-Range", "Accept-Ranges"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  });

  try {
    await s3.send(command);
    console.log("Successfully set CORS policy.");
  } catch (err) {
    console.error("Failed to set CORS:", err);
  }
}

setCors();
