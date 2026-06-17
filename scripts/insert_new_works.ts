import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://tagverseiio_db_user:rOpwHr5WqhHJL7lr@tsk.ww6wcoc.mongodb.net/?appName=TSK";
const client = new MongoClient(uri);

const newWorks = [
  { name: "GOA", slug: "goa", number: "08" },
  { name: "Mix Master", slug: "mix-master", number: "09" },
  { name: "Soora", slug: "soora", number: "10" },
  { name: "Simmasanam", slug: "simmasanam", number: "11" },
  { name: "Best Perfume", slug: "best-perfume", number: "12" }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("TSK");
    const caseStudies = db.collection("caseStudies");

    for (const work of newWorks) {
      const existing = await caseStudies.findOne({ slug: work.slug });
      if (!existing) {
        await caseStudies.insertOne({
          name: work.name,
          firstName: work.name,
          lastName: "",
          slug: work.slug,
          category: "Uncategorized",
          year: "2024",
          count: work.number,
          tagline: "",
          description: "",
          heroTagline: "",
          services: [],
          driveFolder: "",
          number: work.number,
          featured: false,
          image: "",
          bgImage: "",
          media: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Created new work: ${work.name}`);
      } else {
        console.log(`⚠️ Work already exists: ${work.name}`);
      }
    }
  } catch (error) {
    console.error("Error creating new works:", error);
  } finally {
    await client.close();
  }
}

run();
