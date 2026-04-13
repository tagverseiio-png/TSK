import RosterList from "@/components/RosterList";
import WorkBonus from "@/components/WorkBonus";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
async function getCaseStudies() {
  try {
    const client = await clientPromise.connect();
    const db = client.db(process.env.MONGODB_DB || "TSK");
    const docs = await db
      .collection("caseStudies")
      .find({})
      .sort({ number: 1 })
      .toArray();

    const fixUrl = (url?: string) => url ? url.replace(/^http:\/\/localhost:\d+/, process.env.NEXT_PUBLIC_API_URL || "https://tsk-alpha.vercel.app") : "";

    return docs.map((doc) => ({
      id: doc._id.toString(),
      firstName: (doc.firstName as string) || "",
      lastName: (doc.lastName as string) || "",
      slug: doc.slug as string,
      count: doc.count as string,
      category: doc.category as string,
      image: fixUrl(doc.image as string),
      featured: (doc.featured as boolean) || false,
    }));
  } catch (err) {
    console.error("[work] Failed to fetch case studies, using empty list:", err);
    return [];
  }
}

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="min-h-screen bg-[#15110f] w-full overflow-hidden">
      <RosterList
        items={caseStudies}
        basePath="work"
        pageLabel="OUR PORTFOLIO"
        subline="Bold campaigns. Cinematic visuals. Real results."
      />
      <WorkBonus />
    </div>
  );
}
