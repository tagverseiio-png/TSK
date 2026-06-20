import { S3Client, PutBucketPolicyCommand, DeletePublicAccessBlockCommand } from "@aws-sdk/client-s3";
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

async function setPolicy() {
  const bucketName = process.env.AWS_S3_BUCKET || "tsk-website";
  console.log(`Setting public read policy for bucket: ${bucketName}`);

  try {
    console.log("Removing public access block...");
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: bucketName }));
  } catch (err) {
    console.log("Could not remove public access block (may already be removed or missing permissions).", err);
  }
  
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/*`
      }
    ]
  };

  const command = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(policy),
  });

  try {
    await s3.send(command);
    console.log("Successfully set bucket policy.");
  } catch (err) {
    console.error("Failed to set bucket policy:", err);
  }
}

setPolicy();
