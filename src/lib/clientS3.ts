import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";

// Access credentials safely from environment
const region = process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1";
const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "tsk-website";
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "";
const roleArn = process.env.NEXT_PUBLIC_AWS_MEDIACONVERT_ROLE || "";
const mcEndpoint = process.env.NEXT_PUBLIC_AWS_MEDIACONVERT_ENDPOINT || "";

const getCredentials = () => {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured in your environment (.env.local).");
  }
  return { accessKeyId, secretAccessKey };
};

// Initialize Clients
export const getS3Client = () => {
  return new S3Client({
    region,
    credentials: getCredentials(),
  });
};

export const getMediaConvertClient = () => {
  if (!mcEndpoint) {
    throw new Error("MediaConvert endpoint is not configured in your environment (.env.local).");
  }
  return new MediaConvertClient({
    region,
    endpoint: mcEndpoint,
    credentials: getCredentials(),
  });
};

/**
 * Uploads a file directly to the S3 bucket from the browser using Multipart Chunked Uploads.
 * This is highly resilient and fast for large files.
 */
export async function uploadFileToS3Direct(
  file: File,
  key: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const client = getS3Client();

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
    },
    // Customize part sizes (e.g. 5MB minimum)
    queueSize: 4,
    partSize: 1024 * 1024 * 5,
    leavePartsOnError: false,
  });

  upload.on("httpUploadProgress", (progress) => {
    if (progress.loaded && progress.total && onProgress) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      onProgress(percent);
    }
  });

  await upload.done();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Triggers a serverless AWS MediaConvert job to process a raw video file.
 * The job generates:
 * - High-Quality MP4 (1080p)
 * - Low-Quality MP4 (720p)
 * - Standard-Quality MP4 (1080p, moderate bitrate)
 * - Apple HLS multi-bitrate stream (master, 720p, 480p)
 * - Video Poster image (at the 2-second mark)
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
  const client = getMediaConvertClient();

  if (!roleArn) {
    throw new Error("MediaConvert IAM role ARN is not configured in .env.local");
  }

  const inputPath = `s3://${bucket}/${rawS3Key}`;
  const outputDestination = `s3://${bucket}/works/`;

  const jobSettings = {
    Role: roleArn,
    Settings: {
      Inputs: [
        {
          FileInput: inputPath,
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
          VideoSelector: {},
          TimecodeSource: "ZEROBASED",
        },
      ],
      OutputGroups: [
        // ─── Group 1: MP4 File Group ──────────────────────────────────────────
        {
          Name: "File Group",
          Outputs: [
            // Standard Quality
            {
              ContainerSettings: {
                Container: "MP4",
              },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 2500000,
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                    SceneChangeDetect: "ENABLED",
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 128000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
              NameModifier: "_compressed",
            },
            // High Quality
            {
              ContainerSettings: {
                Container: "MP4",
              },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 4500000,
                    QvbrSettings: {
                      QvbrQualityLevel: 8,
                    },
                    SceneChangeDetect: "ENABLED",
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 128000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
              NameModifier: "_high",
            },
            // Low Quality
            {
              ContainerSettings: {
                Container: "MP4",
              },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 1200000,
                    QvbrSettings: {
                      QvbrQualityLevel: 6,
                    },
                    SceneChangeDetect: "ENABLED",
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
              NameModifier: "_low",
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: outputDestination + baseFilename,
            },
          },
        },
        // ─── Group 2: Apple HLS Stream Group ─────────────────────────────────
        {
          Name: "Apple HLS",
          Outputs: [
            // HLS 720p Variant
            {
              ContainerSettings: {
                Container: "M3U8",
              },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 2200000,
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                    SceneChangeDetect: "ENABLED",
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
              NameModifier: "_720p",
            },
            // HLS 480p Variant
            {
              ContainerSettings: {
                Container: "M3U8",
              },
              VideoDescription: {
                Width: 854,
                Height: 480,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 800000,
                    QvbrSettings: {
                      QvbrQualityLevel: 6,
                    },
                    SceneChangeDetect: "ENABLED",
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 64000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
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
        // ─── Group 3: Frame Capture (Poster image extraction) ─────────────────
        {
          Name: "Poster Frame Capture",
          Outputs: [
            {
              ContainerSettings: {
                Container: "RAW",
              },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "FRAME_CAPTURE",
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 2, // Capture at ~2 seconds
                    MaxCaptures: 1,
                    Quality: 80,
                  },
                },
              },
            },
          ],
          OutputGroupSettings: {
            Type: "FRAME_CAPTURE_GROUP_SETTINGS",
            FrameCaptureSettings: {
              Destination: `${outputDestination}${baseFilename}_poster`,
            },
          },
        },
      ],
    },
  };

  const command = new CreateJobCommand(jobSettings as any);
  await client.send(command);

  // Return the expected final URLs on S3 where MediaConvert will deposit the outputs
  return {
    url: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_compressed.mp4`,
    srcHigh: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_high.mp4`,
    srcLow: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_low.mp4`,
    poster: `https://${bucket}.s3.${region}.amazonaws.com/works/${baseFilename}_poster.0000000.jpg`,
    hlsUrl: `https://${bucket}.s3.${region}.amazonaws.com/works/hls/${baseFilename}/master.m3u8`,
  };
}
