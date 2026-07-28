import Link from "next/link";
import Image from "next/image";
import clientPromise from "@/lib/mongodb";
import ExploreButton from "@/components/ExploreButton";

export const revalidate = 30; // ISR: serve cached, revalidate every 30s

interface ServiceData {
    slug: string;
    title: string;
    description: string;
    features: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    number: string;
}

async function getService(slug: string): Promise<ServiceData | null> {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "TSK");
        const doc = await db.collection("services").findOne({ slug });
        if (!doc) return null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const fixUrl = (url?: string) => {
            if (!url) return '';
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                return url.replace(/http:\/\/(?:localhost|127\.0\.0\.1):\d+/, apiUrl);
            }
            return url;
        };

        return {
            slug: doc.slug as string,
            title: doc.title as string,
            description: doc.description as string,
            features: (doc.features as string[]) || [],
            mediaUrl: fixUrl(doc.mediaUrl as string),
            mediaType: doc.mediaType as 'image' | 'video',
            number: doc.number as string,
        };
    } catch (err) {
        console.error("[services/slug] Failed to fetch service:", err);
        return null;
    }
}

export default async function ServicePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const service = await getService(slug);

    if (!service) {
        return (
            <div className="min-h-screen bg-[#15110f] flex items-center justify-center text-white font-monument text-2xl">
                Service Not Found
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#15110f] text-white flex flex-col overflow-x-hidden pb-32">
            <div className="w-full px-6 md:px-[64px] lg:px-[80px] pt-[140px] md:pt-[180px]">
                {/* Breadcrumb */}
                <Link href="/services" className="inline-flex items-center gap-2 text-white/50 hover:text-brand-orange transition-colors font-monument text-[10px] tracking-widest uppercase mb-12 md:mb-16">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to Services
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 lg:gap-24 mb-16 md:mb-24">
                    {/* Left Column (60%) */}
                    <div className="w-full lg:w-[60%]">
                        <span className="font-monument text-brand-orange text-[10px] md:text-[12px] tracking-[4px] uppercase mb-4 md:mb-6 block">
                            Service {service.number}
                        </span>
                        <h1 className="font-space font-bold text-[12vw] md:text-[10vw] lg:text-[8.5vw] xl:text-[130px] leading-[0.9] lg:tracking-[-4px] uppercase text-white">
                            {service.title}
                        </h1>
                    </div>

                    {/* Right Column (40%) */}
                    <div className="w-full lg:w-[40%] lg:pt-8 xl:pt-16 flex flex-col items-start lg:max-w-[500px]">
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed tracking-wide mb-8 md:mb-10">
                            {service.description}
                        </p>
                        <ExploreButton />
                    </div>
                </div>

                <div className="w-full h-[1px] bg-white/10 mb-16 md:mb-24" />

                {/* Media Showcase */}
                <div id="explore" className="w-full aspect-video bg-white/5 relative overflow-hidden mb-24 md:mb-32 rounded-2xl">
                    {service.mediaUrl ? (
                        service.mediaType === 'video' ? (
                            <video 
                                src={service.mediaUrl} 
                                autoPlay 
                                muted 
                                loop 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Image 
                                src={service.mediaUrl} 
                                alt={service.title} 
                                fill
                                className="object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border border-white/10">
                            <span className="font-monument text-[10px] text-white/20 uppercase">Media Showcase</span>
                        </div>
                    )}
                </div>

                {/* Key Features */}
                <div className="mb-24 md:mb-32">
                    <h2 className="font-space font-bold text-3xl md:text-5xl mb-12 md:mb-16 tracking-tight">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
                        {service.features.map((feature, i) => (
                            <div key={i} className="flex flex-col border-t border-white/10 pt-6 md:pt-8 group">
                                <span className="font-monument text-brand-orange text-[10px] mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</span>
                                <h3 className="font-space font-bold text-xl md:text-2xl tracking-tight text-white/90 group-hover:text-white transition-colors">{feature}</h3>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
