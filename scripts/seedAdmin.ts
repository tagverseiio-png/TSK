/**
 * Seed admin user — run once.
 * Usage: npx tsx scripts/seedAdmin.ts
 * Default: admin@tsk.com / tsk@admin2024
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";
const DEFAULT_EMAIL = "admin@tsk.com";
const DEFAULT_PASSWORD = "tsk@admin2024";

async function seedAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const existing = await db.collection("adminUsers").findOne({ email: DEFAULT_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin user already exists: ${DEFAULT_EMAIL}`);
    } else {
      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
      await db.collection("adminUsers").insertOne({
        email: DEFAULT_EMAIL,
        passwordHash,
        createdAt: new Date(),
      });
      console.log(`✅ Admin user created`);
      console.log(`   Email:    ${DEFAULT_EMAIL}`);
      console.log(`   Password: ${DEFAULT_PASSWORD}`);
      console.log(`\n⚠️  Change your password in MongoDB Atlas after first login!`);
    }
  } finally {
    await client.close();
  }
}

seedAdmin().catch((e) => { console.error(e); process.exit(1); });
