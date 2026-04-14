import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "TSK";

const services = [
    { slug: 'creative-direction', title: "Creative Direction", description: "TRANSLATING VISION INTO VISUAL AUTHORITY. WE ARCHITECT THE NARRATIVE ARC AND AESTHETIC BLUEPRINT THAT DEFINES YOUR BRAND'S LEGACY.", features: ["Brand Architecture", "Visual Identity Systems", "Strategic Narrative", "Art Direction", "Moodboarding & Concepts", "Aesthetic Refinement"], number: "01" },
    { slug: 'professional-photography', title: "Professional Photography", description: "CAPTURING THE IMPERCEPTIBLE. HIGH-END STILL IMAGERY DESIGNED TO EVOKE EMOTION AND COMMAND INSTANT MARKET ATTENTION.", features: ["Editorial Portraits", "Product Macro-Studio", "Lifestyle Content", "High-End Retouching", "Location Scouting", "Lighting Design"], number: "02" },
    { slug: 'social-media-content', title: "Social Media Content", description: "DYNAMIC ENGAGEMENT. WE CRAFT SHORT-FORM NARRATIVES THAT DISRUPT THE SCROLL AND CONVERT FLEETING ATTENTION INTO BRAND LOYALTY.", features: ["Vertical Short-Form Video", "Viral Content Strategy", "Daily Engagement Clips", "Platform-Specific Hooks", "Trend Integration", "Community Narrative"], number: "03" },
    { slug: 'commercial-ads', title: "High-End Commercials", description: "CINEMATIC STORYTELLING. WE PRODUCE BROADCAST-QUALITY COMMERCIALS THAT MERGE ARTISTRY WITH AGGRESSIVE MARKET POSITIONING.", features: ["TVC Production", "Digital Ad Campaigns", "Cinematic Storytelling", "Post-Production Mastery", "Casting & Styling", "Sound Engineering"], number: "04" },
    { slug: 'brand-campaigns', title: "Brand Campaigns", description: "INTEGRATED DOMINANCE. COHESIVE STRATEGIES ACROSS ALL TOUCHPOINTS TO ENSURE YOUR BRAND VOICES ARE LOUD, CLEAR, AND UNFORGETTABLE.", features: ["Multi-Channel Strategy", "Impact Measurement", "Content Pillars", "Global Brand Alignment", "Consumer Psychology", "Market Entry Plans"], number: "05" },
    { slug: 'account-growth', title: "Account Growth", description: "VIRAL VELOCITY. DATA-DRIVEN SCALING STRATEGIES TO EXPAND YOUR DIGITAL FOOTPRINT AND MAXIMIZE AUDIENCE RETENTION.", features: ["Organic Scaling", "Data Analytics", "Audience Retention", "Community Management", "SEO Optimization", "Engagement Pod Strategy"], number: "06" },
    { slug: 'event-coverage', title: "Event Coverage", description: "IMMERSIVE DOCUMENTATION. WE CAPTURE THE ENERGY AND SCALE OF YOUR EVENTS, TRANSFORMING MOMENTS INTO PERENNIAL MARKETING ASSETS.", features: ["Live Highlight Reels", "BTS Documentation", "Multi-Cam Coverage", "Instant Editing", "Social Media Takeovers", "VIP Interviews"], number: "07" },
    { slug: 'influencer-marketing', title: "Influencer Marketing", description: "STRATEGIC ALIGNMENT. CONNECTING YOUR BRAND WITH AUTHORITATIVE VOICES TO GENERATE AUTHENTIC TRUST AND MASSIVE REACH.", features: ["Partner Selection", "Campaign Management", "Contracting", "Content Collaboration", "Performance Tracking", "Brand Safety"], number: "08" },
    { slug: 'podcast-services', title: "Podcast Services", description: "AUDITORY AUTHORITY. END-TO-END PRODUCTION FOR PODCASTS THAT POSITION YOU AS A THOUGHT LEADER IN YOUR INDUSTRY.", features: ["Audio Engineering", "Guest Sourcing", "Show Notes & SEO", "Visual Podcast Clips", "Sponsorship Strategy", "Distribution"], number: "09" },
    { slug: 'concert-production', title: "Concert Production", description: "SPECTACLE ENGINEERING. FROM STAGE DESIGN TO LIVE VISUALS, WE CREATE AUDIO-VISUAL EXPERIENCES THAT DEFINE THE CULTURAL MOMENT.", features: ["Stage Production", "Live Visual Graphics", "Lighting Choreography", "Technical Direction", "Fan Experience Design", "Documentation"], number: "10" },
];

async function seed() {
    let client: MongoClient | null = null;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        
        for (const s of services) {
            await db.collection("services").updateOne(
                { slug: s.slug },
                { $set: { ...s, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
                { upsert: true }
            );
        }
        console.log("Services seeded successfully!");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await client?.close();
        process.exit();
    }
}

seed();
