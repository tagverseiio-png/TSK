import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Singleton MongoDB connection for the Express server.
 * Reuses the same client/db across all requests instead of
 * creating a new MongoClient per request (which leaks connections).
 */
export async function getDb(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "TSK";

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(dbName);

  return { client: cachedClient, db: cachedDb };
}
