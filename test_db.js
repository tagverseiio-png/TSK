const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "TSK");
  const docs = await db.collection("caseStudies").find({}).sort({ number: 1 }).toArray();
  
  if (docs.length >= 3) {
    console.log("Work 3 ID:", docs[2]._id);
    console.log("Work 3 Name:", docs[2].name);
    console.log("Work 3 Media:", JSON.stringify(docs[2].media, null, 2));
  }
  await client.close();
}
run();
