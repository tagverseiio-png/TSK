"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Loader } from "lucide-react";

// Fallback skeleton logos if none exist yet
const PLACEHOLDER_LOGOS = [
    "https://placehold.co/200x100/15110f/444444.png?text=LOGO+1",
    "https://placehold.co/200x100/15110f/444444.png?text=LOGO+2",
    "https://placehold.co/200x100/15110f/444444.png?text=LOGO+3",
    "https://placehold.co/200x100/15110f/444444.png?text=LOGO+4",
    "https://placehold.co/200x100/15110f/444444.png?text=LOGO+5",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function WorkBonus() {
    const [logos, setLogos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/clients`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const fixedLogos = data.map((c: any) => c.logo.replace(/^http:\/\/localhost:\d+/, API_BASE));
                    setLogos(fixedLogos);
                } else {
                    setLogos(PLACEHOLDER_LOGOS);
                }
            })
            .catch(() => setLogos(PLACEHOLDER_LOGOS))
            .finally(() => setLoading(false));
    }, []);

    // Duplicate logos for seamless infinite scrolling
    const marqueeItems = [...logos, ...logos, ...logos, ...logos];

    return (
        <div className="bg-[#15110f] relative z-30">
            {/* ── DIVIDER ── */}
            <div className="w-full px-6 md:px-[5rem]">
                <div className="w-full h-[1px] bg-white/10" />
            </div>

            {/* ── OUR CLIENTS SECTION ── */}
            <section className="px-6 md:px-[5rem] py-16 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-10 md:gap-14"
                >
                    {/* Header */}
                    <div className="flex items-start gap-4 md:gap-6">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Users className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                            {/* Adjusted mobile typography: text-[6vw] instead of 7vw to prevent overlay */}
                            <h2 className="font-monument font-bold text-[6vw] md:text-[3.5vw] uppercase leading-[1.1] md:leading-[0.95] tracking-tight text-white mb-2 md:mb-3">
                                Our Clients
                            </h2>
                            <p className="text-white/40 text-[11px] md:text-[14px] tracking-wide max-w-[500px] leading-relaxed">
                                Trusted by brands across Singapore, Malaysia & India.
                            </p>
                        </div>
                    </div>

                    {/* Infinite Logo Marquee */}
                    <div className="relative w-full overflow-hidden flex items-center py-4 border-y border-white/[0.03]">
                        {/* Gradient fades on edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#15110f] to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#15110f] to-transparent z-10 pointer-events-none" />

                        {loading ? (
                            <div className="w-full h-24 flex items-center justify-center">
                                <Loader size={24} className="text-brand-orange/50 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex w-[200%] md:w-[200%] animate-logo-scroll items-center">
                                {marqueeItems.map((logo, idx) => (
                                    <div 
                                        key={idx} 
                                        className="w-40 md:w-56 h-16 md:h-24 flex-shrink-0 flex items-center justify-center mx-4 md:mx-8 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
                                    >
                                        <img 
                                            src={logo} 
                                            alt={`Client Logo ${idx}`} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER TAGLINE ── */}
            <div className="w-full px-6 md:px-[5rem] pb-12">
                <div className="w-full h-[1px] bg-white/10 mb-6 md:mb-8" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-white/20 text-[9px] md:text-[11px] font-monument tracking-[2px] uppercase">
                        TSK — Where vision becomes visual authority.
                    </p>
                    <p className="text-white/15 text-[8px] md:text-[10px] tracking-wider">
                        © 2024 The Simple Krew. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
