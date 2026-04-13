import Link from "next/link";
import PhotographerHero from "@/components/PhotographerHero";

export function generateStaticParams() {
    return [
        { slug: 'growth-architecture' },
        { slug: 'performance-branding' },
        { slug: 'content-production' },
        { slug: 'digital-ecosystems' },
    ]
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const names: Record<string, string> = {
        'growth-architecture': "Growth Architecture",
        'performance-branding': "Performance Branding",
        'content-production': "Content Production",
        'digital-ecosystems': "Digital Ecosystems",
    };

    const numbers: Record<string, string> = {
        'growth-architecture': "01",
        'performance-branding': "02",
        'content-production': "03",
        'digital-ecosystems': "04",
    };

    const currentName = names[slug] || 'Strategy';
    const currentNumber = numbers[slug] || '00';

    const bios: Record<string, string> = {
        'growth-architecture': "DEEP-DIVE STRATEGY. WE STRUCTURE THE FUNNELS, DATA PIPELINES, AND POSITIONING REQUIRED TO DOMINATE YOUR VERTICAL REGIONALLY.",
        'performance-branding': "WE CRAFT PREMIUM BRAND IDENTITIES DESIGNED SOLELY TO COMMAND MARKET RESPECT AND HEAVILY DICTATE LONG-TERM PRICING POWER.",
        'content-production': "HIGH-FIDELITY NARRATIVE EXECUTION. TRANSFORMING CREATIVE MOMENTUM INTO SUSTAINABLE, MONETIZABLE BRAND ASSETS AND VIDEO CAMPAIGNS.",
        'digital-ecosystems': "OMNICHANNEL MANAGEMENT FOR SCALING EVENTS AND CREATORS. TURN YOUR ERRATIC AUDIENCE INTO CONTROLLED, PREDICTABLE LEAD FLOW.",
    };

    const currentBio = bios[slug] || '';
    const servicesList = Object.entries(names).map(([s, n]) => ({ slug: s, name: n.toUpperCase() }));

    return (
        <div className="relative min-h-screen bg-[#15110f]">
            {/* Left fixed Sub-navigation of Services */}
            <div className="hidden md:flex flex-col gap-2 fixed left-[2.5rem] top-32 z-40 text-[10px] md:text-[12px] font-bold tracking-[0.8px] font-monument uppercase mix-blend-difference pointer-events-auto">
                {servicesList.map((srv) => (
                    <Link
                        key={srv.slug}
                        href={`/services/${srv.slug}`}
                        className={`transition-colors py-2 ${slug === srv.slug ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {srv.name}
                    </Link>
                ))}
            </div>

            <PhotographerHero title={currentName} bio={currentBio} number={currentNumber} />
        </div>
    );
}
