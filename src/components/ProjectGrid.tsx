"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
    id: string;
    image: string;
    brand: string;
    director: string;
    slug: string;
    size?: "large" | "medium" | "small";
}

export default function ProjectGrid({ title, projects, basePath }: { title: string, projects: Project[], basePath: string }) {

    // Split title logic like COMMER + CIALS or NARRA + TIVE
    const halfway = Math.ceil(title.length / 2);
    const firstHalf = title.slice(0, halfway).toUpperCase();
    const secondHalf = title.slice(halfway).toUpperCase();

    return (
        <div className="min-h-screen bg-[#15110f] overflow-x-hidden">

            {/* Massive Hero Text Section */}
            <div className="relative w-full h-screen flex items-center justify-center pointer-events-none">
                <div className="relative flex flex-col items-center justify-center text-white font-monument font-bold leading-[0.8] tracking-tight uppercase text-[15vw] md:text-[18vw]">
                    {/* Central Logo behind/between text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[24vw] md:w-[15vw]">
                        <img src="/IMG-20250512-WA0018-removebg-preview.png" alt="TSK Logo" className="w-full h-auto invert mix-blend-screen opacity-50" />
                    </div>
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="z-20 mix-blend-difference">{firstHalf}</motion.div>
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="z-20 mix-blend-difference ml-[10%] md:ml-[15%]">{secondHalf}</motion.div>
                </div>

                {/* Huge Numbers to the side like "11" or "03" from screenshots */}
                <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 font-monument text-white/50 text-[3vw] md:text-[2vw]">
                    {title === "Growth" ? "01" : title === "Branding" ? "02" : "03"}
                </div>
            </div>

            <div className="px-6 md:px-[5rem] columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 z-20 relative bg-[#15110f]">
                {projects.map((proj, idx) => (
                    <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        className="group block overflow-hidden rounded-[2rem] bg-[#15110f] break-inside-avoid"
                    >
                        <Link href={`/${basePath}/${proj.slug}`} className="block w-full h-full cursor-pointer">
                            <div className="relative w-full aspect-[4/5] object-cover md:aspect-auto md:h-[40rem] overflow-hidden rounded-[2rem]">
                                <motion.div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${proj.image})` }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#15110f]/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <div className="text-white font-bold tracking-[0.5px] uppercase text-[15px] md:text-[1.8rem]">
                                        {proj.brand}
                                    </div>
                                    <div className="text-white/80 tracking-[0.5px] uppercase text-[12px] md:text-[1.4rem]">
                                        {proj.director}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="mt-24 mb-16 flex justify-center pb-8 border-b border-white/10 mx-6 md:mx-[5rem]">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex flex-col items-center gap-4 text-white hover:text-[#f16920] transition-colors uppercase font-monument text-[10px] md:text-[12px] font-bold tracking-[1px] group"
                >
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-4 h-4 text-white group-hover:text-[#f16920]"
                    >
                        ↓
                    </motion.div>
                    SCROLL TO EXPLORE
                </button>
            </div>
        </div>
    );
}
