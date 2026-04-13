/**
 * Seed script — run once to populate MongoDB with existing hardcoded data.
 * Usage: npx tsx scripts/seed.ts
 */
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

// ────────────────────────────────────────────────
// DATA — mirrors the existing hardcoded content
// ────────────────────────────────────────────────

const studioConfig = {
  baseRate: 80,
  minHours: 2,
  videoCoverage: 200,
  reelNoSubs: 100,
  reelWithSubs: 150,
  fullPodcast: 300,
  whatsappNumber: "1234567890", // ← Replace with the real number in Atlas
  timeSlots: ["10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"],
};

const caseStudies = [
  {
    slug: "chuan-watch",
    name: "Chuan Watch",
    firstName: "Chuan",
    lastName: "Watch",
    category: "Product Photography",
    year: "2024",
    count: "50+",
    tagline: "Luxury Product Campaign · 50+ Cinematic Shots · Photography · 2024",
    description:
      "Luxury product campaign — 50+ cinematic shots positioning Chuan Watch as a premium timepiece brand. Strongest visual card — place as hero / first card on the site.",
    heroTagline:
      "ENGINEERED A LUXURY PRODUCT PHOTOGRAPHY CAMPAIGN WITH 50+ CINEMATIC SHOTS THAT POSITIONED CHUAN WATCH AS A PREMIUM TIMEPIECE BRAND.",
    services: [
      "Product Photography",
      "Creative Direction",
      "Cinematic Lighting",
      "Post-Production",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1vmCBxVz4NuRewc3ktMkV-KqNcSHqZc7K",
    number: "01",
    featured: true,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200", caption: "Hero shot — cinematic dial close-up" },
      { type: "image", src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200", caption: "Wrist lifestyle — premium positioning" },
      { type: "image", src: "https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?q=80&w=1200", caption: "Flat lay — brand collection" },
      { type: "image", src: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=1200", caption: "Detail macro — movement & craftsmanship" },
    ],
  },
  {
    slug: "concert-campaign",
    name: "Concert Campaign",
    firstName: "Concert",
    lastName: "Campaign",
    category: "Video Production",
    year: "2024",
    count: "01",
    tagline: "Live Concert Production · Event Coverage · Video Production · 2024",
    description:
      "Full-scale live concert coverage — from pre-production planning to the final cut, including video production, event photography, and live production support.",
    heroTagline:
      "PRODUCED FULL-SCALE LIVE CONCERT COVERAGE THAT CAPTURED EVERY HIGH-ENERGY MOMENT FROM STAGE TO SCREEN.",
    services: [
      "Concert & Live Production",
      "Event Coverage",
      "Video Production",
      "Post-Production",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1PiQC9_4wLmfl5U2Hv9PdmDojEcGWICAH",
    number: "02",
    featured: false,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200", caption: "Main stage — full crowd energy" },
      { type: "image", src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200", caption: "Artist performance — spotlight moment" },
      { type: "image", src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200", caption: "Crowd aerial — scale & atmosphere" },
      { type: "image", src: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200", caption: "Stage lighting — production design" },
      { type: "image", src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1200", caption: "Backstage — behind the scenes" },
    ],
  },
  {
    slug: "diamond-pearl",
    name: "Diamond Pearl",
    firstName: "Diamond",
    lastName: "Pearl",
    category: "Brand Campaign",
    year: "2024",
    count: "01",
    tagline: "Brand Campaign · Photography · Commercial Ads · 2024",
    description:
      "Luxury brand identity built through commercial photography and aspirational visual storytelling — elevating Diamond Pearl's market positioning.",
    heroTagline:
      "BUILT A LUXURY BRAND IDENTITY THROUGH COMMERCIAL PHOTOGRAPHY AND ASPIRATIONAL VISUAL STORYTELLING.",
    services: [
      "Brand Campaign Strategy",
      "Commercial Photography",
      "Video Production",
      "Creative Direction",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1pAmqoJZI-eULCb3gzj7tNvHvMyvWutjP",
    number: "03",
    featured: false,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200", caption: "Hero visual — luxury brand identity" },
      { type: "image", src: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200", caption: "Product styling — premium feel" },
      { type: "image", src: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1200", caption: "Campaign shoot — aspirational mood" },
      { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200", caption: "Close-up detail — craftsmanship" },
      { type: "image", src: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1200", caption: "Editorial spread — brand story" },
    ],
  },
  {
    slug: "dnet",
    name: "DNet",
    firstName: "DNet",
    lastName: "",
    category: "Commercial Ads",
    year: "2024",
    count: "01",
    tagline: "DNet Interior · Commercial Campaign · Video Production · Brand Strategy · 2024",
    description:
      "Compelling commercial campaign that positioned DNet as the authority in interior design — brand-aligned video production and strategy that drove recognition.",
    heroTagline:
      "CRAFTED A COMPELLING COMMERCIAL CAMPAIGN THAT POSITIONED DNET AS THE AUTHORITY IN INTERIOR DESIGN.",
    services: [
      "Commercial Ads",
      "Video Production",
      "Brand Strategy",
      "Creative Direction",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1OxEyioo0ToQPM0_mH7OtDCw3109tmAGi",
    number: "04",
    featured: false,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200", caption: "Interior showcase — living space" },
      { type: "image", src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200", caption: "Modern design — minimalist aesthetic" },
      { type: "image", src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200", caption: "Kitchen reveal — premium finishes" },
      { type: "image", src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200", caption: "Luxury bathroom — commercial shoot" },
      { type: "image", src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200", caption: "Brand environment — design authority" },
    ],
  },
  {
    slug: "kree",
    name: "Kree",
    firstName: "Kree",
    lastName: "",
    category: "Content Creation",
    year: "2024",
    count: "01",
    tagline: "Kree · Content Production · Photography · Social Media Content · 2024",
    description:
      "Consistent, high-quality content production pipeline across photography and social media — built to maintain visual quality at scale from shoot to post.",
    heroTagline:
      "DELIVERED CONSISTENT, HIGH-QUALITY CONTENT PRODUCTION ACROSS PHOTOGRAPHY AND SOCIAL MEDIA AT SCALE.",
    services: [
      "Social Media Content",
      "Professional Photography",
      "Creative Direction",
      "Post-Production",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1X69xFTGyQ-xSRLXpZ1yxuG0W6OLHq6ps",
    number: "05",
    featured: false,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200", caption: "Content grid — social media pipeline" },
      { type: "image", src: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200", caption: "Studio shoot — creative direction" },
      { type: "image", src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200", caption: "Flat lay — content production" },
      { type: "image", src: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200", caption: "Behind the camera — shoot day" },
      { type: "image", src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200", caption: "Team workflow — post-production" },
    ],
  },
  {
    slug: "ruchi",
    name: "Ruchi",
    firstName: "Ruchi",
    lastName: "",
    category: "Social Media",
    year: "2024",
    count: "01",
    tagline: "Ruchi · Social & Digital Campaign · Creator-Led · Influencer · 2024",
    description:
      "Organic growth driven through social strategy, creator-led content and targeted influencer activation — growing reach and driving authentic audience engagement.",
    heroTagline:
      "DROVE ORGANIC GROWTH THROUGH SOCIAL STRATEGY, CREATOR-LED CONTENT AND TARGETED INFLUENCER ACTIVATION.",
    services: [
      "Social Media Strategy",
      "Content Creation",
      "Influencer Collaborations",
      "Account Growth",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/1WFcttkRuVJBRh-bPn6HaqMOsSFDy3mhJ",
    number: "06",
    featured: false,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1200", caption: "Social strategy — feed curation" },
      { type: "image", src: "https://images.unsplash.com/photo-1563986768609-322da13575f2?q=80&w=1200", caption: "Creator content — authentic engagement" },
      { type: "image", src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200", caption: "Influencer activation — campaign reach" },
      { type: "image", src: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1200", caption: "Community growth — audience building" },
      { type: "image", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200", caption: "Analytics dashboard — real results" },
    ],
  },
  {
    slug: "super-deluxe",
    name: "Super Deluxe",
    firstName: "Super",
    lastName: "Deluxe",
    category: "Brand Identity",
    year: "2024",
    count: "01",
    tagline:
      "Super Deluxe Kitchen · Brand Campaign · Photography · Commercial Ads · 2024",
    description:
      "Homegrown kitchen brand elevated into a premium commercial identity — bold campaign visuals that turned a local favourite into a recognisable brand.",
    heroTagline:
      "ELEVATED A HOMEGROWN KITCHEN BRAND INTO A PREMIUM COMMERCIAL IDENTITY WITH BOLD CAMPAIGN VISUALS.",
    services: [
      "Brand Campaign Strategy",
      "Commercial Photography",
      "Video Production",
      "Creative Direction",
    ],
    driveFolder:
      "https://drive.google.com/drive/folders/15BD5E8WHTPkem3rCCy8bDWoTqZvNeeUE",
    number: "07",
    featured: false,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000",
    bgImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000",
    media: [
      { type: "image", src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200", caption: "Hero plate — signature dish" },
      { type: "image", src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200", caption: "Food styling — premium presentation" },
      { type: "image", src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200", caption: "Restaurant interior — brand environment" },
      { type: "image", src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1200", caption: "Close-up detail — culinary craft" },
      { type: "image", src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200", caption: "Kitchen action — behind the brand" },
    ],
  },
];

// ────────────────────────────────────────────────
// SEED
// ────────────────────────────────────────────────

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db(dbName);

    // Studio Config — upsert so re-running is idempotent
    const configCol = db.collection("studioConfig");
    await configCol.deleteMany({});
    await configCol.insertOne(studioConfig);
    console.log("✅ Seeded studioConfig");

    // Case Studies — drop & re-insert
    const studiesCol = db.collection("caseStudies");
    await studiesCol.deleteMany({});
    await studiesCol.insertMany(caseStudies);
    console.log(`✅ Seeded ${caseStudies.length} case studies`);

    // Create indexes
    await studiesCol.createIndex({ slug: 1 }, { unique: true });
    console.log("✅ Created index on caseStudies.slug");

    console.log("\n🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
