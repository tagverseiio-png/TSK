import Link from "next/link";
import PhotographerHero from "@/components/PhotographerHero";
import clientPromise from "@/lib/mongodb";

export const revalidate = 30;

async function getBrandingCaseData(slug: string) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "TSK");
        const doc = await db.collection("caseStudies").findOne({ slug });
        const allDocs = await db.collection("caseStudies").find({}).project({ slug: 1, name: 1 }).toArray();
        return {
            doc,
            caseList: allDocs.map((d) => ({ slug: d.slug as string, name: (d.name as string).toUpperCase() }))
        };
    } catch {
        return { doc: null, caseList: [] };
    }
}

export default async function BrandingProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { doc, caseList } = await getBrandingCaseData(slug);

    const currentName = doc?.name as string || slug.toUpperCase();
    const currentBio = (doc?.description as string) || (doc?.tagline as string) || '';
    const number = (doc?.number as string) || "02";

    return (
        <div className="relative min-h-screen bg-[#15110f]">
            {caseList.length > 0 && (
                <div className="hidden md:flex flex-col gap-2 fixed left-[2.5rem] top-32 z-40 text-[10px] md:text-[12px] font-bold tracking-[0.8px] font-monument uppercase mix-blend-difference pointer-events-auto">
                    {caseList.map((cs) => (
                        <Link
                            key={cs.slug}
                            href={`/branding/${cs.slug}`}
                            className={`transition-colors py-2 ${slug === cs.slug ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                        >
                            {cs.name}
                        </Link>
                    ))}
                </div>
            )}

            <PhotographerHero title={currentName} bio={currentBio} number={number} />
        </div>
    );
}

