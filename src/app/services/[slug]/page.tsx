import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import ProjectGrid from "@/components/ProjectGrid";
import CleanServiceHero from "@/components/CleanServiceHero";

export function generateStaticParams() {
    return [
        { slug: 'creative-direction' },
        { slug: 'professional-photography' },
        { slug: 'social-media-content' },
        { slug: 'commercial-ads' },
        { slug: 'brand-campaigns' },
        { slug: 'account-growth' },
        { slug: 'event-coverage' },
        { slug: 'influencer-marketing' },
        { slug: 'podcast-services' },
        { slug: 'concert-production' },
    ]
}

async function getServiceWorks(slug: string) {
    try {
        const client = await clientPromise.connect();
        const db = client.db(process.env.MONGODB_DB || "TSK");

        // Map slug to category if needed, or search by tag
        // For now, let's just get featured or latest works to ensure page has content
        const docs = await db
            .collection("caseStudies")
            .find({})
            .limit(6)
            .toArray();

        const fixUrl = (url?: string) => url ? url.replace(/^http:\/\/localhost:\d+/, process.env.NEXT_PUBLIC_API_URL || "https://tsk-alpha.vercel.app") : "";

        return docs.map((doc) => ({
            id: doc._id.toString(),
            brand: (doc.firstName as string) || "TSK",
            director: (doc.category as string) || "Project",
            slug: (doc.slug as string) || "",
            image: fixUrl(doc.image as string),
            size: "medium" as const
        }));
    } catch (err) {
        console.error("[service] Failed to fetch works:", err);
        return [];
    }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const relatedWorks = await getServiceWorks(slug);

    const names: Record<string, string> = {
        'creative-direction': "Creative Direction",
        'professional-photography': "Professional Photography",
        'social-media-content': "Social Media Content",
        'commercial-ads': "High-End Commercials",
        'brand-campaigns': "Brand Campaigns",
        'account-growth': "Account Growth",
        'event-coverage': "Event Coverage",
        'influencer-marketing': "Influencer Marketing",
        'podcast-services': "Podcast Services",
        'concert-production': "Concert Production",
    };

    const numbers: Record<string, string> = {
        'creative-direction': "01",
        'professional-photography': "02",
        'social-media-content': "03",
        'commercial-ads': "04",
        'brand-campaigns': "05",
        'account-growth': "06",
        'event-coverage': "07",
        'influencer-marketing': "08",
        'podcast-services': "09",
        'concert-production': "10",
    };

    const bios: Record<string, string> = {
        'creative-direction': "TRANSLATING VISION INTO VISUAL AUTHORITY. WE ARCHITECT THE NARRATIVE ARC AND AESTHETIC BLUEPRINT THAT DEFINES YOUR BRAND'S LEGACY.",
        'professional-photography': "CAPTURING THE IMPERCEPTIBLE. HIGH-END STILL IMAGERY DESIGNED TO EVOKE EMOTION AND COMMAND INSTANT MARKET ATTENTION.",
        'social-media-content': "DYNAMIC ENGAGEMENT. WE CRAFT SHORT-FORM NARRATIVES THAT DISRUPT THE SCROLL AND CONVERT FLEETING ATTENTION INTO BRAND LOYALTY.",
        'commercial-ads': "CINEMATIC STORYTELLING. WE PRODUCE BROADCAST-QUALITY COMMERCIALS THAT MERGE ARTISTRY WITH AGGRESSIVE MARKET POSITIONING.",
        'brand-campaigns': "INTEGRATED DOMINANCE. COHESIVE STRATEGIES ACROSS ALL TOUCHPOINTS TO ENSURE YOUR BRAND VOICES ARE LOUD, CLEAR, AND UNFORGETTABLE.",
        'account-growth': "VIRAL VELOCITY. DATA-DRIVEN SCALING STRATEGIES TO EXPAND YOUR DIGITAL FOOTPRINT AND MAXIMIZE AUDIENCE RETENTION.",
        'event-coverage': "IMMERSIVE DOCUMENTATION. WE CAPTURE THE ENERGY AND SCALE OF YOUR EVENTS, TRANSFORMING MOMENTS INTO PERENNIAL MARKETING ASSETS.",
        'influencer-marketing': "STRATEGIC ALIGNMENT. CONNECTING YOUR BRAND WITH AUTHORITATIVE VOICES TO GENERATE AUTHENTIC TRUST AND MASSIVE REACH.",
        'podcast-services': "AUDITORY AUTHORITY. END-TO-END PRODUCTION FOR PODCASTS THAT POSITION YOU AS A THOUGHT LEADER IN YOUR INDUSTRY.",
        'concert-production': "SPECTACLE ENGINEERING. FROM STAGE DESIGN TO LIVE VISUALS, WE CREATE AUDIO-VISUAL EXPERIENCES THAT DEFINE THE CULTURAL MOMENT.",
    };

    const currentName = names[slug] || 'Strategy';
    const currentNumber = numbers[slug] || '00';
    const currentBio = bios[slug] || '';

    const servicesList = Object.keys(names).map(s => ({
        slug: s,
        name: names[s].toUpperCase(),
        number: numbers[s]
    })).sort((a, b) => parseInt(a.number) - parseInt(b.number));

    return (
        <div className="relative min-h-screen bg-[#15110f] flex flex-col overflow-y-auto overflow-x-hidden">
            {/* Desktop Side Navigation */}
            <div className="hidden md:flex flex-col gap-3 fixed right-[4rem] top-1/2 -translate-y-1/2 z-40 text-[9px] font-bold tracking-[1.5px] font-monument uppercase mix-blend-difference pointer-events-auto items-end">
                <span className="text-white/20 mb-4 tracking-[3px]">Index</span>
                {servicesList.map((srv) => (
                    <Link
                        key={srv.slug}
                        href={`/services/${srv.slug}`}
                        className={`transition-all duration-300 py-1 border-r-2 pr-4 ${slug === srv.slug ? 'text-brand-orange border-brand-orange' : 'text-white/30 border-transparent hover:text-white/80 hover:border-white/20'}`}
                    >
                        {srv.name}
                    </Link>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col w-full">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <CleanServiceHero title={currentName} bio={currentBio} number={currentNumber} />
                </section>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#15110f]/80 backdrop-blur-md border-t border-white/10 px-6 py-4">
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
                    {servicesList.map((srv) => (
                        <Link
                            key={srv.slug}
                            href={`/services/${srv.slug}`}
                            className={`whitespace-nowrap font-monument text-[9px] tracking-[1px] uppercase transition-colors ${slug === srv.slug ? 'text-brand-orange' : 'text-white/40'}`}
                        >
                            {srv.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
