import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tskapi.t4gverse.com";

async function fixUrls() {
    let client: MongoClient | null = null;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);

        const services = await db.collection("services").find({}).toArray();
        let fixed = 0;

        for (const svc of services) {
            if (svc.mediaUrl && (svc.mediaUrl.includes("localhost") || svc.mediaUrl.includes("127.0.0.1"))) {
                const newUrl = svc.mediaUrl.replace(/http:\/\/(?:localhost|127\.0\.0\.1):\d+/, API_URL);
                await db.collection("services").updateOne(
                    { _id: svc._id },
                    { $set: { mediaUrl: newUrl } }
                );
                console.log(`Fixed: ${svc.slug}`);
                console.log(`  Old: ${svc.mediaUrl}`);
                console.log(`  New: ${newUrl}`);
                fixed++;
            }
        }

        console.log(`\nDone! Fixed ${fixed} service URL(s).`);
    } catch (err) {
        console.error("Failed:", err);
    } finally {
        await client?.close();
        process.exit();
    }
}

fixUrls();
