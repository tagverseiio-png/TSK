"use client";

import { motion } from "framer-motion";

interface CleanServiceHeroProps {
    title: string;
    bio: string;
    number: string;
}

export default function CleanServiceHero({ title, bio, number }: CleanServiceHeroProps) {
    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
            {/* Subtle Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-5">
                <img 
                    src="/IMG-20250512-WA0018-removebg-preview.png" 
                    alt="Watermark" 
                    className="w-[80vw] h-auto object-contain invert"
                />
            </div>

            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-6">
                {/* Service Number Tag */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="font-monument text-[10px] md:text-[12px] tracking-[4px] text-brand-orange uppercase"
                >
                    Service {number}
                </motion.div>

                {/* Main Title - Clean, centered, high-end */}
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-monument text-[8vw] md:text-[6vw] lg:text-[5vw] leading-[1.1] tracking-tight text-white uppercase"
                >
                    {title}
                </motion.h1>

                {/* Description - Focused and readable */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-white/60 text-[14px] md:text-[16px] leading-relaxed tracking-wide max-w-2xl mx-auto mt-4 font-inter"
                >
                    {bio}
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-brand-orange to-transparent" />
                <span className="text-[9px] font-monument tracking-[2px] text-white/30 uppercase">Scroll</span>
            </motion.div>
        </div>
    );
}
