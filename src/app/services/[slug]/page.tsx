"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface ServiceData {
    _id?: string;
    slug: string;
    title: string;
    description: string;
    features: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    number: string;
}

export default function ServicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const [service, setService] = useState<ServiceData | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Fix URLs stored as localhost in the DB (happens when SERVER_URL isn't set on prod)
    const fixUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return url.replace(/http:\/\/(?:localhost|127\.0\.0\.1):\d+/, API_URL);
        }
        return url;
    };

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await fetch(`${API_URL}/api/services/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    // Fix media URL before setting state
                    if (data.mediaUrl) {
                        data.mediaUrl = fixUrl(data.mediaUrl);
                    }
                    setService(data);
                }
            } catch (err) {
                console.error("Failed to fetch service:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-[#15110f] flex items-center justify-center text-white font-monument">Loading...</div>;
    if (!service) return <div className="min-h-screen bg-[#15110f] flex items-center justify-center text-white font-monument">Service Not Found</div>;

    return (
        <div className="relative min-h-screen bg-[#15110f] text-white flex flex-col overflow-x-hidden pt-32 pb-20 px-6 md:px-[5rem] lg:px-[8rem]">
            {/* Header / Hero Area */}
            <div className="max-w-6xl w-full mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 relative"
                >
                    <Link href="/services" className="inline-flex items-center gap-2 text-white/50 hover:text-brand-orange transition-colors font-monument text-[10px] tracking-widest uppercase mb-8">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Services
                    </Link>
                    <span className="font-monument text-brand-orange text-[12px] tracking-[4px] uppercase mb-4 block">Service {service.number}</span>
                    <h1 className="font-monument text-5xl md:text-7xl lg:text-[7vw] leading-none uppercase mb-8">
                        {service.title}
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-3xl font-light tracking-wide">
                        {service.description}
                    </p>
                </motion.div>

                {/* Main Content: Features | Media */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mt-20">
                    {/* Left: Key Features */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-12"
                    >
                        <h2 className="font-monument text-2xl uppercase tracking-tighter border-b border-white/10 pb-4 w-fit">Key Features</h2>
                        <div className="grid grid-cols-1 gap-8">
                            {service.features.map((feature, i) => (
                                <div key={i} className="group border-b border-white/5 pb-6">
                                    <span className="text-brand-orange font-monument text-[10px] mb-2 block opacity-50 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</span>
                                    <h3 className="font-monument text-sm md:text-lg uppercase group-hover:translate-x-2 transition-transform duration-300">{feature}</h3>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Media Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="relative aspect-square md:aspect-[4/5] w-full bg-white/5 rounded-[2rem] overflow-hidden group shadow-2xl backdrop-blur-sm"
                    >
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
                                <img 
                                    src={service.mediaUrl} 
                                    alt={service.title} 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10">
                                <span className="font-monument text-[10px] text-white/20 uppercase">Media Showcase</span>
                            </div>
                        )}
                        
                        {/* Abstract Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-10 left-10 z-20">
                             <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-brand-orange" />
                             </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Decorations - Optimized using radial-gradients to avoid heavy blur computation */}
            <div className="fixed top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
            <div className="fixed bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
        </div>
    );
}
