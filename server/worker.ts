import { processVideoPipeline } from "./utils/videoProcessor";

console.log(`🎬 Video Processing Worker (PID ${process.pid}) is ready and listening for jobs.`);

process.on("message", async (msg: any) => {
  if (msg.type === "PROCESS_VIDEO") {
    console.log(`🎬 Video Worker received job for: ${msg.payload.baseFilename}`);
    try {
      await processVideoPipeline(
        msg.payload.inputPath,
        msg.payload.outputDir,
        msg.payload.baseFilename,
        msg.payload.hlsOutputDir
      );
      console.log(`✅ Video Worker completed job for: ${msg.payload.baseFilename}`);
    } catch (err) {
      console.error(`❌ Video Worker failed job for ${msg.payload.baseFilename}:`, err);
    }
  }
});
