/**
 * Client-side video compression using Canvas + MediaRecorder.
 * Compresses large videos to fit under a target size (default 90MB)
 * before uploading, so they pass through Cloudflare's 100MB limit.
 *
 * The server pipeline will re-encode to MP4/HLS anyway, so WebM
 * output from MediaRecorder is perfectly fine as input.
 */

const TARGET_SIZE_BYTES = 90 * 1024 * 1024; // 90MB (safe margin under 100MB)
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;

export interface CompressionProgress {
  stage: "loading" | "compressing" | "done";
  percent: number;
}

/**
 * Check if a video file needs client-side compression.
 */
export function needsCompression(file: File): boolean {
  return file.type.startsWith("video/") && file.size > TARGET_SIZE_BYTES;
}

/**
 * Compress a video file client-side using Canvas + MediaRecorder.
 * Returns a new File object with the compressed video (WebM format).
 */
export function compressVideo(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    onProgress?.({ stage: "loading", percent: 0 });

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration) || duration === 0) {
        URL.revokeObjectURL(objectUrl);
        // Can't determine duration — skip compression, let server handle it
        resolve(file);
        return;
      }

      // Calculate target bitrate to hit ~90MB output
      // targetBitrate (bps) = targetSizeBytes * 8 / durationSeconds
      const targetBitrate = Math.min(
        Math.floor((TARGET_SIZE_BYTES * 8) / duration),
        8_000_000 // Cap at 8Mbps for reasonable quality
      );

      // Calculate scaled dimensions (maintain aspect ratio, max 1280x720)
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Ensure even dimensions (required by most codecs)
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;

      onProgress?.({ stage: "loading", percent: 50 });

      // Set video to start
      video.currentTime = 0;

      video.onseeked = () => {
        onProgress?.({ stage: "compressing", percent: 0 });

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;

        // Capture stream from canvas at 30fps
        const stream = canvas.captureStream(30);

        // Try to capture audio from the video element
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination); // needed to keep playback
          dest.stream.getAudioTracks().forEach((track) => {
            stream.addTrack(track);
          });
        } catch {
          // No audio or audio capture not supported — continue without audio
        }

        // Determine best supported MIME type
        const mimeTypes = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
        ];
        let mimeType = "video/webm";
        for (const mt of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mt)) {
            mimeType = mt;
            break;
          }
        }

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: targetBitrate,
        });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(objectUrl);
          const blob = new Blob(chunks, { type: mimeType });
          const compressedName = file.name.replace(/\.[^.]+$/, "") + "_compressed.webm";
          const compressedFile = new File([blob], compressedName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          onProgress?.({ stage: "done", percent: 100 });
          resolve(compressedFile);
        };

        recorder.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          // On error, return original file and let server handle it
          resolve(file);
        };

        recorder.start(1000); // Collect data every second

        // Render loop: draw video frames to canvas
        let animFrame: number;
        const drawFrame = () => {
          if (video.ended || video.paused) {
            recorder.stop();
            cancelAnimationFrame(animFrame);
            return;
          }

          ctx.drawImage(video, 0, 0, width, height);

          // Report progress
          if (duration > 0) {
            const pct = Math.min(
              Math.round((video.currentTime / duration) * 100),
              99
            );
            onProgress?.({ stage: "compressing", percent: pct });
          }

          animFrame = requestAnimationFrame(drawFrame);
        };

        video.onended = () => {
          cancelAnimationFrame(animFrame);
          // Small delay to ensure last frames are captured
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 200);
        };

        // Start playback (drives the recording)
        video.play().then(() => {
          drawFrame();
        }).catch(() => {
          URL.revokeObjectURL(objectUrl);
          // Autoplay blocked — return original
          resolve(file);
        });
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Can't load video — return original, let server handle it
      resolve(file);
    };
  });
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
