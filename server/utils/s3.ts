import { S3Client, DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: process.env.AWS_REGION || "eu-north-1",
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
 * Generates a presigned PUT URL for direct client S3 uploads without exposing credentials
 */
export async function getPresignedUploadUrl(s3Key: string, contentType: string): Promise<string> {
  const client = getS3Client();
  const bucketName = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 900 }); // 15 minutes
}

/**
 * Dispatches an AWS MediaConvert Job safely from the server
 */
export async function dispatchMediaConvertJob(rawS3Key: string, baseFilename: string) {
  const region = process.env.AWS_REGION || "eu-north-1";
  const bucket = getBucketName();
  const roleArn = process.env.AWS_MEDIACONVERT_ROLE || process.env.NEXT_PUBLIC_AWS_MEDIACONVERT_ROLE || "";
  const mcEndpoint = process.env.AWS_MEDIACONVERT_ENDPOINT || process.env.NEXT_PUBLIC_AWS_MEDIACONVERT_ENDPOINT || "";

  if (!mcEndpoint || !roleArn) {
    throw new Error("AWS MediaConvert endpoint or role ARN is not configured on the server.");
  }

  const client = new MediaConvertClient({
    region,
    endpoint: mcEndpoint,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  const inputPath = `s3://${bucket}/${rawS3Key}`;
  const outputDestination = `s3://${bucket}/works/`;

  const jobSettings = {
    Role: roleArn,
    Settings: {
      Inputs: [
        {
          FileInput: inputPath,
          AudioSelectors: {
            "Audio Selector 1": { DefaultSelection: "DEFAULT" },
          },
          VideoSelector: {},
          TimecodeSource: "ZEROBASED",
        },
      ],
      OutputGroups: [
        {
          Name: "File Group",
          Outputs: [
            {
              ContainerSettings: { Container: "MP4" },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 6000000, QvbrSettings: { QvbrQualityLevel: 8 }, SceneChangeDetect: "ENABLED" },
                },
              },
              AudioDescriptions: [{ AudioSourceName: "Audio Selector 1", CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 128000, SampleRate: 48000, CodingMode: "CODING_MODE_2_0" } } }],
              NameModifier: "_compressed",
            },
            {
              ContainerSettings: { Container: "MP4" },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 10000000, QvbrSettings: { QvbrQualityLevel: 9 }, SceneChangeDetect: "ENABLED" },
                },
              },
              AudioDescriptions: [{ AudioSourceName: "Audio Selector 1", CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 128000, SampleRate: 48000, CodingMode: "CODING_MODE_2_0" } } }],
              NameModifier: "_high",
            },
            {
              ContainerSettings: { Container: "MP4" },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 3000000, QvbrSettings: { QvbrQualityLevel: 7 }, SceneChangeDetect: "ENABLED" },
                },
              },
              AudioDescriptions: [{ AudioSourceName: "Audio Selector 1", CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 96000, SampleRate: 48000, CodingMode: "CODING_MODE_2_0" } } }],
              NameModifier: "_low",
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: { Destination: outputDestination + baseFilename },
          },
        },
        {
          Name: "Apple HLS",
          Outputs: [
            {
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 4500000, QvbrSettings: { QvbrQualityLevel: 8 }, SceneChangeDetect: "ENABLED" },
                },
              },
              AudioDescriptions: [{ AudioSourceName: "Audio Selector 1", CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 96000, SampleRate: 48000, CodingMode: "CODING_MODE_2_0" } } }],
              NameModifier: "_720p",
            },
            {
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: {
                Width: 854,
                Height: 480,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 2000000, QvbrSettings: { QvbrQualityLevel: 7 }, SceneChangeDetect: "ENABLED" },
                },
              },
              AudioDescriptions: [{ AudioSourceName: "Audio Selector 1", CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 64000, SampleRate: 48000, CodingMode: "CODING_MODE_2_0" } } }],
              NameModifier: "_480p",
            },
          ],
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              Destination: `${outputDestination}hls/${baseFilename}/master`,
              SegmentLength: 6,
              MinSegmentLength: 0,
            },
          },
        },
        {
          Name: "Poster Frame Capture",
          Outputs: [
            {
              ContainerSettings: { Container: "RAW" },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "FRAME_CAPTURE",
                  FrameCaptureSettings: { FramerateNumerator: 1, FramerateDenominator: 2, MaxCaptures: 1, Quality: 85 },
                },
              },
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: { Destination: `${outputDestination}${baseFilename}_poster` },
          },
        },
      ],
    },
  };

  const command = new CreateJobCommand(jobSettings as any);
  await client.send(command);

  return {
    url: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_compressed.mp4`,
    srcHigh: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_high.mp4`,
    srcLow: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_low.mp4`,
    poster: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_poster.0000000.jpg`,
    hlsUrl: `https://${bucket}.s3.${region}.amazonaws.com/works/hls/${baseFilename}/master.m3u8`,
  };
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
