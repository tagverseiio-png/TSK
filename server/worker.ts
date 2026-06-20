import { processVideoPipeline } from "./utils/videoProcessor";
import { uploadToS3, uploadDirectoryToS3 } from "./utils/s3";
import path from "path";
import fs from "fs";

console.log(`🎬 Video Processing Worker (PID ${process.pid}) is ready and listening for jobs.`);

process.on("message", async (msg: any) => {
  if (msg.type === "PROCESS_VIDEO") {
    console.log(`🎬 Video Worker received job for: ${msg.payload.baseFilename}`);
    try {
      const result = await processVideoPipeline(
        msg.payload.inputPath,
        msg.payload.outputDir,
        msg.payload.baseFilename,
        msg.payload.hlsOutputDir
      );
      
      console.log(`⬆️ Uploading generated video files to S3 for: ${msg.payload.baseFilename}`);
      
      const { standard, high, low, poster } = result;
      const { outputDir, baseFilename, hlsOutputDir } = msg.payload;

      // Upload individual files
      await uploadToS3(path.join(outputDir, standard), `works/${standard}`, "video/mp4");
      await uploadToS3(path.join(outputDir, high), `works/${high}`, "video/mp4");
      await uploadToS3(path.join(outputDir, low), `works/${low}`, "video/mp4");
      await uploadToS3(path.join(outputDir, poster), `works/${poster}`, "image/webp");

      // Upload HLS directory
      await uploadDirectoryToS3(hlsOutputDir, `works/hls/${baseFilename}`);

      console.log(`✅ Upload complete! Cleaning up local files for: ${baseFilename}`);

      // Clean up local files
      const filesToDelete = [standard, high, low, poster];
      for (const file of filesToDelete) {
        const filePath = path.join(outputDir, file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      if (fs.existsSync(hlsOutputDir)) {
        fs.rmSync(hlsOutputDir, { recursive: true, force: true });
      }

      console.log(`🎉 Video Worker fully completed job for: ${msg.payload.baseFilename}`);
    } catch (err) {
      console.error(`❌ Video Worker failed job for ${msg.payload.baseFilename}:`, err);
    }
  }
});
