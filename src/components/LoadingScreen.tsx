"use client";

import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Prefetch the data the site needs
async function prefetchData() {
    await Promise.allSettled([
        fetch(`${API_BASE}/api/services`),
        fetch(`${API_BASE}/api/works`),
        fetch(`${API_BASE}/api/clients`),
    ]);
}

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [count, setCount] = useState(0);
    const [phase, setPhase] = useState<"loading" | "exit">("loading");
    const dataLoaded = useRef(false);
    const startTime = useRef(Date.now());
    const MIN_DURATION = 2800; // minimum ms to show the loader

    useEffect(() => {
        // Start fetching data
        prefetchData().then(() => {
            dataLoaded.current = true;
        });

        // Animate counter: 0→50 fast (0–1.4s), 50→100 slightly slower (1.4–2.8s)
        let frame: number;
        const animate = () => {
            const elapsed = Date.now() - startTime.current;
            // Ease-out curve mapped to 0–100 over MIN_DURATION ms
            const progress = Math.min(elapsed / MIN_DURATION, 1);
            // Ease-out cubic: fast start, slows near 100
            const eased = 1 - Math.pow(1 - progress, 3);
            const newCount = Math.floor(eased * 100);
            setCount(newCount);

            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            } else {
                // Counter hit 100 — wait a tiny beat then exit
                setTimeout(() => {
                    setPhase("exit");
                    setTimeout(onComplete, 900);
                }, 200);
            }
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase === "loading" && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: "-100%",
                        transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
                    }}
                    className="fixed inset-0 z-[9999] bg-[#0c0a08] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Radial glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.08)_0%,transparent_70%)]" />
                    </div>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-16 relative"
                    >
                        <Image
                            src="/IMG-20250512-WA0010-removebg-preview.png"
                            alt="TSK"
                            width={120}
                            height={60}
                            className="w-[5rem] md:w-[7rem] h-auto invert brightness-200"
                            priority
                        />
                    </motion.div>

                    {/* Counter */}
                    <div className="relative flex flex-col items-center gap-6">

                        {/* Progress bar */}
                        <div className="w-[240px] md:w-[320px] h-[1.5px] bg-white/10 relative overflow-hidden rounded-full">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-brand-orange rounded-full"
                                style={{ width: `${count}%` }}
                                transition={{ duration: 0.05 }}
                            />
                        </div>

                        {/* Status label */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-monument text-[9px] md:text-[10px] tracking-[4px] uppercase text-white/30"
                        >
                            {count < 35
                                ? "Initialising"
                                : count < 65
                                ? "Loading Assets"
                                : count < 90
                                ? "Almost Ready"
                                : "Welcome"}
                        </motion.p>
                    </div>

                    {/* Bottom brand tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="absolute bottom-10 left-0 right-0 flex justify-center"
                    >
                        <p className="font-monument text-[8px] md:text-[9px] tracking-[3px] uppercase text-white/15">
                            THE SIMPLE KREW
                            <span className="text-brand-orange/50">.</span>
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
