"use client";

import { motion } from "framer-motion";
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
    return (
        <div className="bg-[#15110f] min-h-screen text-white overflow-hidden flex flex-col">

            {/* Page Hero Header */}
            {pageLabel && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="pt-[22vh] md:pt-[28vh] pb-16 md:pb-24 px-6 md:px-[5rem] relative z-30"
                >
                    <div className="flex items-end gap-4 md:gap-6 mb-6">
                        <h1 className="font-monument font-bold text-[10vw] md:text-[6vw] uppercase leading-[0.9] tracking-tight text-white">
                            {pageLabel}
                        </h1>
                        <div className="hidden md:block w-[8rem] h-[1px] bg-brand-orange mb-[1.2vw]" />
                    </div>
                    {subline && (
                        <p className="text-white/40 text-[13px] md:text-[15px] tracking-wide max-w-[600px] leading-relaxed">
                            {subline}
                        </p>
                    )}
                    <div className="mt-8 w-full h-[1px] bg-white/10" />
                </motion.div>
            )}

            {/* Fixed Central Line & Orange Star Overlay */}
            <div className="fixed top-1/2 left-0 w-full z-40 pointer-events-none -translate-y-1/2">
                {/* Horizontal line */}
                <div className="w-full h-[1px] bg-white/20 absolute top-1/2 left-0 -translate-y-1/2" />

                {/* Fixed Logo in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#15110f] px-4 md:px-6">
                    <img src="/IMG-20250512-WA0012-removebg-preview.png" alt="TSK Logo" className="w-[6rem] md:w-[8rem] h-auto invert" />
                </div>
            </div>

            {/* Static Sub-container */}
            <div className="w-full relative z-30 pt-[5vh] pb-[25vh]">
                {items.map((item, idx) => (
                    <div key={item.id} className="relative w-full h-[50vh]">
                        <Link href={`/${basePath}/${item.slug}`} className="absolute inset-0 block w-full h-full">
                            <ScrollBlock item={item} index={idx} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScrollBlock({ item, index }: { item: RosterItem; index: number }) {
    return (
        <div className="group relative flex items-center justify-center h-full w-full hover:bg-white/[0.02] transition-colors duration-500 overflow-hidden">
            {/* Featured badge */}
            {item.featured && (
                <div className="absolute top-6 left-6 md:left-[5rem] flex items-center gap-2 z-30">
                    <span className="text-brand-orange text-[10px] md:text-[11px] font-monument font-bold tracking-[2px] uppercase">
                        ★ Featured
                    </span>
                </div>
            )}

            {/* Index number on the left */}
            <div className="absolute left-6 md:left-[5rem] top-1/2 -translate-y-1/2 font-monument text-white/10 text-[8vw] md:text-[5vw] font-bold z-10 pointer-events-none">
                {String(index + 1).padStart(2, "0")}
            </div>

            {/* Category tag */}
            {item.category && (
                <div className="absolute left-6 md:left-[5rem] bottom-6 font-monument text-white/30 text-[9px] md:text-[10px] tracking-[2px] uppercase z-20 group-hover:text-brand-orange/60 transition-colors duration-500">
                    {item.category}
                </div>
            )}

            <div className="flex flex-col items-center justify-center font-monument font-bold tracking-[0.5px] uppercase leading-[1.1] md:leading-[0.95] text-[8vw] md:text-[6.5vw] text-zinc-300 group-hover:text-white transition-colors duration-300 relative z-20">
                <div>{item.firstName}</div>
                {item.lastName && <div>{item.lastName}</div>}
            </div>

            {/* Right side Camera and count */}
            <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 flex items-center gap-3 font-monument text-white/40 text-[4vw] md:text-[1.8vw] group-hover:text-white/80 transition-colors duration-300 z-20 pointer-events-none">
                {/* SVG Camera Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 131.4 101" className="w-[1.8rem] md:w-[2.2rem] fill-[#15110f] stroke-white/40 stroke-[4px] group-hover:stroke-white/80 transition-colors duration-300 mt-[-0.3rem]">
                    <path d="M99.2,39.2c-.3-4.6-3.9-8.4-8.5-8.7-1.7-.1-10.8.3-11.4-.2-.9-1.9-.9-4.5-2.5-6.1s-1.8-1-2.7-1.1c-5.3-.5-11.5.3-16.9,0-3.8.5-3.7,4.3-4.8,7.1-.7.5-9.7,0-11.5.2-4.9.3-8.2,4.1-8.7,8.9.5,9.3-.7,19.3,0,28.5.5,7.4,5,9.6,11.8,9.9,13.3.6,28.5.3,41.8-.2,4.5-.2,8.2.6,11.4-3.4,1.8-2.2,2.1-4.4,2.2-7.2.3-9.2-.5-18.6-.1-27.8h0ZM69.6,54c-2.4,2.2-2.6,5.9-3.8,8.8-.4,0-1.7-5.9-2.2-6.9-2-3.7-6.7-4-10.2-5.2,3.4-1.2,7.5-1.4,9.7-4.6,1.7-2.4,1.4-5.3,2.7-7.8,1.2,3.2,1.3,7.4,4.4,9.6,2.3,1.7,4.6,1.6,7.1,2.3.4.1.8.1.9.7-2.8.9-6.3,1.1-8.5,3.2h-.1ZM91.7,41.9c-2.2,1.9-5.2-1.2-3.2-3.5,2-2.4,5.9,1.2,3.2,3.5Z" />
                </svg>
                {item.count}
            </div>

            {/* Hover Image Reveal */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden mix-blend-screen z-10 w-full h-full">
                <img src={item.image} alt={item.firstName} className="w-[60%] md:w-[35%] h-auto object-cover blur-[2px] filter grayscale opacity-[0.15] transition-all duration-700 ease-out" />
            </div>
        </div>
    );
}
