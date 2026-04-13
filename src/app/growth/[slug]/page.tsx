import Link from "next/link";
import PhotographerHero from "@/components/PhotographerHero";

export function generateStaticParams() {
    return [
        { slug: 'techfest' },
        { slug: 'acquire' },
        { slug: 'forge' },
    ]
}

export default async function GrowthProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const names: Record<string, string> = {
        'techfest': 'TechFest',
        'acquire': 'Acquire',
        'forge': 'Forge',
    };

    const currentName = names[slug] || 'Growth Project';

    const bios: Record<string, string> = {
        'techfest': 'SCALED TECHFEST AUDIENCE ACQUISITION BY 300% OVER 6 MONTHS.',
        'acquire': 'IMPLEMENTED HIGH-CONVERTING B2B SAAS FUNNELS RESULTING IN MASSIVE PIPELINE SURGE.',
        'forge': 'EXECUTED COMPREHENSIVE MARKET ENTRY STRATEGY FOR FORGE ACROSS APAC.',
    };

    const currentBio = bios[slug] || '';
    const number = "01";

    const caseList = Object.entries(names).map(([s, n]) => ({ slug: s, name: n.toUpperCase() }));

    return (
        <div className="relative min-h-screen bg-[#15110f]">
            <div className="hidden md:flex flex-col gap-2 fixed left-[2.5rem] top-32 z-40 text-[10px] md:text-[12px] font-bold tracking-[0.8px] font-monument uppercase mix-blend-difference pointer-events-auto">
                {caseList.map((cs) => (
                    <Link
                        key={cs.slug}
                        href={`/growth/${cs.slug}`}
                        className={`transition-colors py-2 ${slug === cs.slug ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {cs.name}
                    </Link>
                ))}
            </div>

            <PhotographerHero title={currentName} bio={currentBio} number={number} />
        </div>
    );
}
