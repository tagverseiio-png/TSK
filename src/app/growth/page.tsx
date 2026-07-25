import ProjectGrid from "@/components/ProjectGrid";
import clientPromise from "@/lib/mongodb";

export const revalidate = 30;

async function getGrowthProjects() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "TSK");
        const docs = await db
            .collection("caseStudies")
            .find({
                $or: [
                    { category: { $regex: /growth/i } },
                    { category: { $regex: /brand/i } },
                    { category: { $exists: true } }
                ]
            })
            .sort({ number: 1 })
            .toArray();

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tsk-alpha.vercel.app";
        const fixUrl = (url?: string) => url ? url.replace(/^http:\/\/localhost:\d+/, apiUrl) : "";

        return docs.map((doc) => ({
            id: doc._id.toString(),
            brand: (doc.name as string) || "Project",
            director: (doc.category as string) || "Growth",
            slug: doc.slug as string,
            image: fixUrl((doc.image as string) || (doc.media && doc.media[0] && doc.media[0].src) || ""),
        }));
    } catch (err) {
        console.error("[growth] Failed to fetch case studies:", err);
        return [];
    }
}

export default async function GrowthPage() {
    const projects = await getGrowthProjects();
    return <ProjectGrid title="Growth" projects={projects} basePath="growth" />;
}

