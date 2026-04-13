"use client";

import { motion } from "framer-motion";

export default function PhotographerHero({ title, bio, number }: { title: string, bio: string, number: string }) {

    // Split title logic like MATT + MARTIAN
    const parts = title.split(' ');
    const firstHalf = parts[0].toUpperCase();
    const secondHalf = (parts[1] || '').toUpperCase();

    return (
        <div className="relative min-h-screen bg-[#15110f] overflow-hidden flex flex-col items-center justify-center pt-24 pb-12">

            {/* Massive Hero Text Section */}
            <div className="relative w-full flex flex-col items-center justify-center pointer-events-none mt-12 md:mt-24 h-[70vh]">

                {/* Logo Mask Background Image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[30vw] md:w-[20vw] opacity-40 mix-blend-screen" style={{ WebkitMaskImage: 'url(/IMG-20250512-WA0018-removebg-preview.png)', WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskImage: 'url(/IMG-20250512-WA0018-removebg-preview.png)', maskSize: 'contain', maskPosition: 'center', maskRepeat: 'no-repeat', aspectRatio: '1/1' }}>
                    <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000" className="w-full h-full object-cover grayscale opacity-30" alt="Photographer" />
                </div>

                {/* Central Logo behind/between text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[30vw] md:w-[20vw] mix-blend-screen opacity-[0.15]">
                    <img src="/IMG-20250512-WA0018-removebg-preview.png" alt="TSK Logo" className="w-full h-auto invert" />
                </div>

                <div className="relative flex flex-col items-center justify-center text-white font-monument font-bold leading-[0.85] tracking-tight uppercase text-[15vw] md:text-[18vw]">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="z-20 mix-blend-difference w-full text-center">
                        {firstHalf}
                    </motion.div>
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="z-20 mix-blend-difference w-full text-center mt-[-3vw]">
                        {secondHalf}
                    </motion.div>
                </div>

                {/* Bio Paragraph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-12 max-w-[90%] md:max-w-[45vw] text-center text-white/50 text-[12px] md:text-[14px] leading-[1.6] tracking-wide mx-auto"
                >
                    {bio}
                </motion.div>

                {/* Huge Numbers to the side like "09" */}
                {number && (
                    <div className="hidden md:block absolute right-[5vw] top-[40%] font-monument text-white/50 text-[3vw] md:text-[2vw]">
                        {number}
                    </div>
                )}
            </div>

            {/* Scroll Indication */}
            <div className="mt-auto pt-24 px-6 md:px-[5rem] flex justify-center w-full relative z-20">
                <button
                    onClick={() => {
                        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
                    }}
                    className="flex items-center gap-4 text-white hover:text-[#f16920] transition-colors uppercase font-monument text-[10px] md:text-[12px] font-bold tracking-[1px] group"
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

            {/* The rest of the page would continue here (Portfolio images grid) */}
            {/* But I am building exactly what was provided in Screenshot 5 */}
        </div>
    );
}
