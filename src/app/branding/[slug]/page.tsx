import Link from "next/link";
import PhotographerHero from "@/components/PhotographerHero";

export function generateStaticParams() {
    return [
        { slug: 'ocula' },
        { slug: 'verge' },
        { slug: 'horizon' },
    ]
}

export default async function BrandingProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const names: Record<string, string> = {
        'ocula': 'Ocula',
        'verge': 'Verge',
        'horizon': 'Horizon',
    };

    const currentName = names[slug] || 'Branding Project';

    const bios: Record<string, string> = {
        'ocula': 'CRAFTED A PREMIUM, HIGH-END BRAND IDENTITY FOR OCULA THAT REDEFINED THEIR MARKET POSITIONING.',
        'verge': 'STRATEGIZED VERGE VISUAL ASSETS AND CONTENT STRUCTURE FOR LONG-TERM ENGAGEMENT.',
        'horizon': 'DESIGNED HORIZON\'S OMNICHANNEL BRANDING INFRASTRUCTURE FOR MASS CONSUMER ADOPTION.',
    };

    const currentBio = bios[slug] || '';
    const number = "02";

    const caseList = Object.entries(names).map(([s, n]) => ({ slug: s, name: n.toUpperCase() }));

    return (
        <div className="relative min-h-screen bg-[#15110f]">
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

            <PhotographerHero title={currentName} bio={currentBio} number={number} />
        </div>
    );
}
