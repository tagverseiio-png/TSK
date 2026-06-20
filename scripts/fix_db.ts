import { getDb } from "../server/lib/db";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function fixDb() {
  const { db } = await getDb();
  const caseStudies = await db.collection("caseStudies").find({}).toArray();

  let totalFixed = 0;

  for (const study of caseStudies) {
    let updated = false;
    const mediaList = Array.isArray(study.media) ? [...study.media] : [];

    for (let i = 0; i < mediaList.length; i++) {
      const item = mediaList[i];
      if (item.hlsUrl && item.hlsUrl.includes("https://tsk-website.s3.eu-north-1.amazonaws.com/works/hls/https://")) {
        // Extract the actual ID from the nested URL
        // Example bad URL: https://tsk-website.s3.eu-north-1.amazonaws.com/works/hls/https://tsk-website.s3.eu-north-1.amazonaws.com/works/1397BGpaAO6YxEl-EzaVIYvYsILkBv1WJ_compressed.mp4/master.m3u8
        
        const match = item.hlsUrl.match(/works\/([a-zA-Z0-9_-]+)_compressed\.mp4/);
        if (match && match[1]) {
          const driveId = match[1];
          const fixedUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/works/hls/${driveId}/master.m3u8`;
          console.log(`Fixing HLS URL for ${study.slug}`);
          console.log(`  Old: ${item.hlsUrl}`);
          console.log(`  New: ${fixedUrl}`);
          
          item.hlsUrl = fixedUrl;
          updated = true;
          totalFixed++;
        }
      }
    }

    if (updated) {
      await db.collection("caseStudies").updateOne(
        { _id: study._id },
        { $set: { media: mediaList } }
      );
    }
  }

  console.log(`Finished fixing DB. Total URLs fixed: ${totalFixed}`);
  process.exit(0);
}

fixDb().catch(console.error);
