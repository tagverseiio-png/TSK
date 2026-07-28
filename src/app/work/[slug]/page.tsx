import Link from "next/link";
import WorkCaseContent from "@/components/WorkCaseContent";
import BackButton from "@/components/BackButton";
import type { MediaItem } from "@/components/MediaGallery";
import clientPromise from "@/lib/mongodb";

export const revalidate = 3600; // ISR: rebuild at most once per hour
export const dynamicParams = true; // allow slugs not in generateStaticParams

// Pre-build all known work slug pages at build time — eliminates cold renders
export async function generateStaticParams() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "TSK");
    const slugs = await db
      .collection("caseStudies")
      .find({}, { projection: { slug: 1 } })
      .toArray();
    return slugs
      .filter((d) => !!d.slug)
      .map((d) => ({ slug: d.slug as string }));
  } catch {
    return [];
  }
}

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
 * Fetch only the fields needed — current doc + slim list for sidebar.
 * Two targeted queries instead of one big fetch-all.
 */
async function getPageData(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "TSK");

    // Query 1: current doc (full fields)
    const doc = await db.collection("caseStudies").findOne({ slug });

    // Query 2: sidebar list (slug + name only)
    const allDocs = await db
      .collection("caseStudies")
      .find({}, { projection: { slug: 1, name: 1, number: 1 } })
      .sort({ number: 1 })
      .toArray();

    return { doc, allDocs };
  } catch {
    return { doc: null, allDocs: [] };
  }
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { doc, allDocs } = await getPageData(slug);

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#15110f] flex flex-col items-center justify-center text-white gap-4">
        <p className="font-monument text-xl">Case study not found</p>
        <p className="text-white/40 text-sm">It may have been removed or the URL is incorrect.</p>
      </div>
    );
  }

  const fixUrl = (url?: string) => url ? url.replace(/^http:\/\/localhost:\d+/, process.env.NEXT_PUBLIC_API_URL || "https://tsk-alpha.vercel.app") : "";

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

  // Build sidebar list
  const caseList: CaseListItem[] = allDocs.map((d) => ({
    slug: d.slug as string,
    name: (d.name as string).toUpperCase(),
  }));

  // Next project in chain
  const allSlugs = allDocs.map(d => d.slug as string);
  const currentIndex = allSlugs.indexOf(slug);
  const nextSlug = allSlugs[(currentIndex + 1) % allSlugs.length];
  const nextDoc = allDocs.find(d => d.slug === nextSlug);
  const nextStudyName = (nextDoc?.name as string) || "";

  return (
    <div className="relative min-h-screen bg-[#15110f]">


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
