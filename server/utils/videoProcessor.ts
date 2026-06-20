import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class AsyncQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const res = await task();
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const task = this.queue.shift();
    if (task) {
      await task();
    }
    this.processing = false;
    this.processNext();
  }
}

export const videoQueue = new AsyncQueue();

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
        "-preset fast",
        "-crf 24",
        "-maxrate 2500k",
        "-bufsize 5000k",
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
        "-preset fast",
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
        "-preset fast",
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

export function processVideoPipeline(
  inputPath: string,
  outputDir: string,
  baseFilename: string,
  hlsOutputDir: string,
  onStepProgress?: (step: string, percent: number) => void
) {
  return videoQueue.add(async () => {
    const stdFilename = `${baseFilename}_compressed.mp4`;
    const highFilename = `${baseFilename}_high.mp4`;
    const lowFilename = `${baseFilename}_low.mp4`;
    const posterFilename = `${baseFilename}_poster.webp`;

    const stdPath = path.join(outputDir, stdFilename);
    const highPath = path.join(outputDir, highFilename);
    const lowPath = path.join(outputDir, lowFilename);
    const posterPath = path.join(outputDir, posterFilename);

    // 1. Poster Frame extraction
    if (!fs.existsSync(hlsOutputDir)) {
      fs.mkdirSync(hlsOutputDir, { recursive: true });
    }
    const hls720Path = path.join(hlsOutputDir, "720p.m3u8");
    const hls480Path = path.join(hlsOutputDir, "480p.m3u8");

    // Run all computationally heavy FFmpeg processes concurrently for maximum CPU saturation
    await Promise.all([
      generatePoster(inputPath, posterPath),
      compressStandard(inputPath, stdPath),
      generateVariant(inputPath, highPath, "scale='min(1280,iw)':-2", 22, "3000k", "6000k", "128k"),
      generateVariant(inputPath, lowPath, "scale='min(720,iw)':-2", 26, "1200k", "2400k", "96k"),
      generateHLSVariant(inputPath, hls720Path, "scale='min(1280,iw)':-2", 24, "2500k", "5000k", path.join(hlsOutputDir, "720p_%03d.ts")),
      generateHLSVariant(inputPath, hls480Path, "scale='min(854,iw)':-2", 28, "800k", "1600k", path.join(hlsOutputDir, "480p_%03d.ts"))
    ]);

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
  });
}
