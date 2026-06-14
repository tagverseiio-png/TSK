import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export function compressStandard(
  inputPath: string,
  outputPath: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters("scale='min(1280,iw)':-2")
      .outputOptions([
        "-c:v libx264",
        "-preset slow",
        "-crf 28",
        "-maxrate 1500k",
        "-bufsize 3000k",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart"
      ])
      .toFormat("mp4")
      .on("progress", (info) => {
        if (info && typeof info.percent === "number") {
          onProgress?.(info.percent);
        }
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

export function generatePoster(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(2)
      .outputOptions([
        "-vframes 1",
        "-c:v libwebp",
        "-f image2"
      ])
      .on("end", () => {
        if (fs.existsSync(outputPath)) {
          resolve();
        } else {
          // Fallback to 0 if video is shorter than 2s and no file was generated
          ffmpeg(inputPath)
            .seekInput(0)
            .outputOptions([
              "-vframes 1",
              "-c:v libwebp",
              "-f image2"
            ])
            .on("end", () => {
              if (fs.existsSync(outputPath)) {
                resolve();
              } else {
                reject(new Error("Poster extraction failed: No file generated at seek 0"));
              }
            })
            .on("error", (err2) => reject(err2))
            .save(outputPath);
        }
      })
      .on("error", (err) => {
        // Fallback to 0 if video is shorter than 2s
        ffmpeg(inputPath)
          .seekInput(0)
          .outputOptions([
            "-vframes 1",
            "-c:v libwebp",
            "-f image2"
          ])
          .on("end", () => {
            if (fs.existsSync(outputPath)) {
              resolve();
            } else {
              reject(new Error("Poster extraction failed: No file generated at seek 0 on fallback"));
            }
          })
          .on("error", (err2) => reject(err2))
          .save(outputPath);
      })
      .save(outputPath);
  });
}

export function generateVariant(
  inputPath: string,
  outputPath: string,
  scale: string,
  crf: number,
  maxrate: string,
  bufsize: string,
  audioBitrate: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(scale)
      .outputOptions([
        "-c:v libx264",
        "-preset medium",
        "-crf " + crf,
        "-maxrate " + maxrate,
        "-bufsize " + bufsize,
        "-c:a aac",
        "-b:a " + audioBitrate,
        "-movflags +faststart"
      ])
      .toFormat("mp4")
      .on("progress", (info) => {
        if (info && typeof info.percent === "number") {
          onProgress?.(info.percent);
        }
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

export function generateHLSVariant(
  inputPath: string,
  outputPlaylistPath: string,
  scale: string,
  crf: number,
  maxrate: string,
  bufsize: string,
  segmentPattern: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(scale)
      .outputOptions([
        "-c:v libx264",
        "-profile:v main",
        "-crf " + crf,
        "-maxrate " + maxrate,
        "-bufsize " + bufsize,
        "-c:a aac",
        "-b:a 96k",
        "-hls_time 6",
        "-hls_list_size 0",
        `-hls_segment_filename ${segmentPattern}`,
        "-f hls"
      ])
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPlaylistPath);
  });
}

export async function processVideoPipeline(
  inputPath: string,
  outputDir: string,
  baseFilename: string,
  hlsOutputDir: string,
  onStepProgress?: (step: string, percent: number) => void
) {
  const stdFilename = `${baseFilename}_compressed.mp4`;
  const highFilename = `${baseFilename}_high.mp4`;
  const lowFilename = `${baseFilename}_low.mp4`;
  const posterFilename = `${baseFilename}_poster.webp`;

  const stdPath = path.join(outputDir, stdFilename);
  const highPath = path.join(outputDir, highFilename);
  const lowPath = path.join(outputDir, lowFilename);
  const posterPath = path.join(outputDir, posterFilename);

  // 1. Poster Frame extraction
  onStepProgress?.("poster", 0);
  await generatePoster(inputPath, posterPath);
  onStepProgress?.("poster", 100);

  // 2. Compress Standard (1280p max, CRF 28)
  onStepProgress?.("standard", 0);
  await compressStandard(inputPath, stdPath, (pct) => onStepProgress?.("standard", pct));
  onStepProgress?.("standard", 100);

  // 3. High variant (1280p, CRF 26, 2000k)
  onStepProgress?.("high", 0);
  await generateVariant(
    inputPath,
    highPath,
    "scale='min(1280,iw)':-2",
    26,
    "2000k",
    "4000k",
    "128k",
    (pct) => onStepProgress?.("high", pct)
  );
  onStepProgress?.("high", 100);

  // 4. Low variant (720p, CRF 30, 800k)
  onStepProgress?.("low", 0);
  await generateVariant(
    inputPath,
    lowPath,
    "scale='min(720,iw)':-2",
    30,
    "800k",
    "1600k",
    "96k",
    (pct) => onStepProgress?.("low", pct)
  );
  onStepProgress?.("low", 100);

  // 5. HLS streaming (720p and 480p variants)
  onStepProgress?.("hls", 0);
  if (!fs.existsSync(hlsOutputDir)) {
    fs.mkdirSync(hlsOutputDir, { recursive: true });
  }

  const hls720Path = path.join(hlsOutputDir, "720p.m3u8");
  const hls480Path = path.join(hlsOutputDir, "480p.m3u8");

  await generateHLSVariant(
    inputPath,
    hls720Path,
    "scale='min(1280,iw)':-2",
    28,
    "1000k",
    "2000k",
    path.join(hlsOutputDir, "720p_%03d.ts")
  );
  onStepProgress?.("hls", 50);

  await generateHLSVariant(
    inputPath,
    hls480Path,
    "scale='min(854,iw)':-2",
    32,
    "500k",
    "1000k",
    path.join(hlsOutputDir, "480p_%03d.ts")
  );
  onStepProgress?.("hls", 100);

  // Write master playlist
  const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=600000,RESOLUTION=854x480
480p.m3u8
`;
  fs.writeFileSync(path.join(hlsOutputDir, "master.m3u8"), masterContent, "utf-8");

  // Clean up original file
  if (fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }

  return {
    standard: stdFilename,
    high: highFilename,
    low: lowFilename,
    poster: posterFilename,
    hlsMaster: "master.m3u8"
  };
}
