"use client";

import { m as motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface RosterItem {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    count: string;
    image: string;
    category?: string;
    featured?: boolean;
}

interface RosterListProps {
    items: RosterItem[];
    basePath: string;
    pageLabel?: string;
    subline?: string;
}

export default function RosterList({ items, basePath, pageLabel, subline }: RosterListProps) {
    const isWork = basePath === 'work';

    return (
        <div className="bg-[#15110f] min-h-screen text-white flex flex-col">
            {/* Header Section */}
            {pageLabel && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="px-6 md:px-[64px] lg:px-[80px] pt-[140px] md:pt-[180px] pb-12 relative z-30"
                >
                    <div className="flex flex-col gap-6 max-w-4xl">
                        <span className="font-monument text-brand-orange text-[10px] md:text-[12px] tracking-[4px]">01</span>
                        <h1 className="font-space font-bold text-5xl md:text-6xl lg:text-[80px] uppercase leading-[0.9] tracking-tighter text-white max-w-[800px]">
                            {pageLabel}
                        </h1>
                        {subline && (
                            <p className="text-white/70 text-base md:text-lg tracking-wide max-w-xl leading-relaxed">
                                {subline}
                            </p>
                        )}
                        {/* Shorter intentional accent */}
                        <div className="w-16 h-[2px] bg-brand-orange mt-4" />
                    </div>
                    
                    {/* Divider below intro */}
                    <div className="mt-16 w-full h-[1px] bg-white/10" />
                </motion.div>
            )}

            {/* List Section */}
            <div className="w-full relative z-30 px-6 md:px-[64px] lg:px-[80px] pb-[15vh]">
                <div className="flex flex-col mt-4">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-5%" }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                        >
                            <Link href={`/${basePath}/${item.slug}`} className="group flex flex-col md:flex-row items-start md:items-center justify-between py-10 border-b border-white/5 hover:border-brand-orange/50 transition-colors duration-500 relative">
                                <div className="flex items-center gap-8 md:gap-16 flex-1 pr-4 lg:pr-[340px]">
                                    <span className="font-monument text-white/20 text-sm md:text-lg group-hover:text-brand-orange transition-colors duration-500">
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <h2 className="font-space font-bold text-4xl md:text-6xl text-zinc-300 group-hover:text-white transition-colors duration-300 tracking-tight">
                                        {item.firstName} {item.lastName}
                                    </h2>
                                </div>
                                <div className="mt-6 md:mt-0 flex items-center gap-6 relative z-10">
                                    <div className="hidden lg:block absolute right-[80px] top-1/2 -translate-y-1/2 w-[240px] h-[120px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden bg-white/5 pointer-events-none scale-95 group-hover:scale-100">
                                         {item.image && (
                                            <Image 
                                                src={item.image}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-[#15110f] transition-all duration-300 transform group-hover:rotate-45 relative z-10 bg-[#15110f]">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
