import Link from "next/link";
import WorkCaseContent from "@/components/WorkCaseContent";
import BackButton from "@/components/BackButton";
import type { MediaItem } from "@/components/MediaGallery";
import clientPromise from "@/lib/mongodb";

export const revalidate = 0; // Disable caching so admin updates show instantly

interface CaseStudy {
  name: string;
  category: string;
  year: string;
  tagline: string;
  description: string;
  heroTagline: string;
  services: string[];
  driveFolder: string;
  number: string;
  media: MediaItem[];
  bgImage?: string;
}

interface CaseListItem {
  slug: string;
  name: string;
}

/**
 * Single DB query to fetch ALL case studies (projected to only needed fields),
 * replacing the original 4 separate queries.
 */
async function getAllCaseData() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "TSK");
    const docs = await db
      .collection("caseStudies")
      .find({})
      .sort({ number: 1 })
      .toArray();
    return docs;
  } catch {
    return [];
  }
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const allDocs = await getAllCaseData();

  if (allDocs.length === 0) {
    return (
      <div className="min-h-screen bg-[#15110f] flex flex-col items-center justify-center text-white gap-4">
        <p className="font-monument text-xl">Loading failed</p>
        <p className="text-white/40 text-sm">Server is busy. Please refresh the page.</p>
      </div>
    );
  }

  const fixUrl = (url?: string) => url ? url.replace(/^http:\/\/localhost:\d+/, process.env.NEXT_PUBLIC_API_URL || "https://tsk-alpha.vercel.app") : "";

  // Find current study
  const doc = allDocs.find(d => d.slug === slug);
  if (!doc) {
    return (
      <div className="min-h-screen bg-[#15110f] flex items-center justify-center text-white font-monument text-2xl">
        Case study not found.
      </div>
    );
  }

  const study: CaseStudy = {
    name: doc.name as string,
    category: doc.category as string,
    year: doc.year as string,
    tagline: doc.tagline as string,
    description: doc.description as string,
    heroTagline: doc.heroTagline as string,
    services: doc.services as string[],
    driveFolder: doc.driveFolder as string,
    number: doc.number as string,
    media: (doc.media as any[] || []).map(m => ({
      ...m,
      src: fixUrl(m.src),
      ...(m.poster ? { poster: fixUrl(m.poster) } : {}),
      ...(m.srcHigh ? { srcHigh: fixUrl(m.srcHigh) } : {}),
      ...(m.srcLow ? { srcLow: fixUrl(m.srcLow) } : {}),
      ...(m.hlsUrl ? { hlsUrl: fixUrl(m.hlsUrl) } : {}),
    })),
    bgImage: fixUrl(doc.bgImage as string | undefined),
  };

  // Build sidebar list from the same query
  const caseList: CaseListItem[] = allDocs.map((d) => ({
    slug: d.slug as string,
    name: (d.name as string).toUpperCase(),
  }));

  // Get next project in chain
  const allSlugs = allDocs.map(d => d.slug as string);
  const currentIndex = allSlugs.indexOf(slug);
  const nextSlug = allSlugs[(currentIndex + 1) % allSlugs.length];
  const nextDoc = allDocs.find(d => d.slug === nextSlug);
  const nextStudyName = (nextDoc?.name as string) || "";

  return (
    <div className="relative min-h-screen bg-[#15110f]">
      {/* COMPACT SUB-NAVIGATION — Sidebar on desktop, compact rail/toggle on mobile */}
      <nav className="fixed left-4 md:left-[2.5rem] top-[14rem] md:top-40 z-[50] flex flex-col gap-4 pointer-events-none">
        {/* Desktop compact view (dots/short lines) */}
        <div className="hidden lg:flex flex-col gap-1 pointer-events-auto">
          {caseList.map((cs) => (
            <Link
              key={cs.slug}
              prefetch={false}
              href={`/work/${cs.slug}`}
              className={`group flex items-center gap-3 transition-all duration-500 py-1.5`}
              title={cs.name}
            >
              <span className={`h-[1.5px] transition-all duration-500 rounded-full ${slug === cs.slug ? 'w-8 bg-brand-orange' : 'w-4 bg-white/20 group-hover:w-6 group-hover:bg-white/40'}`} />
              <span className={`text-[9px] font-monument font-bold tracking-[2px] transition-all duration-500 ${slug === cs.slug ? 'text-white opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-60 translate-x-[-10px] group-hover:translate-x-0'}`}>
                {cs.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile/Tablet compact rail */}
        <div className="lg:hidden flex flex-col gap-3 pointer-events-auto bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl">
          {caseList.map((cs) => (
            <Link
              key={cs.slug}
              prefetch={false}
              href={`/work/${cs.slug}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${slug === cs.slug ? 'bg-brand-orange scale-125 shadow-[0_0_10px_rgba(255,107,0,0.5)]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </nav>

      <BackButton />

      {/* Main Content — Left/Right Split Layout */}
      <WorkCaseContent
        study={study}
        slug={slug}
        nextSlug={nextSlug}
        nextStudyName={nextStudyName}
      />
    </div>
  );
}
