"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const projects = [
    {
        id: 1,
        title: "Creative Direction & Concept Planning",
        description: "This is the foundation. Strategy + ideas that drive everything else.",
        video: "/video2.mp4"
    },
    {
        id: 2,
        title: "Professional Photography & Videography",
        description: "Core production service. High demand, visual impact, premium pricing.",
        video: "/video2.mp4"
    },
    {
        id: 3,
        title: "High-End Commercial Ads",
        description: "Biggest money-maker. Brands pay more for cinematic ad production.",
        video: "/video1.mp4"
    },
    {
        id: 4,
        title: "Brand Campaigns & Strategy",
        description: "Long-term client retention + higher-ticket projects.",
        video: "/video1.mp4"
    }
];

const AUTO_ROTATE_TIME = 15; // 15 seconds when muted

export default function HomeVideo() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayIndex, setDisplayIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [videoDuration, setVideoDuration] = useState(AUTO_ROTATE_TIME);
    const [videoOpacity, setVideoOpacity] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastLoadedSrc = useRef<string | null>(null);

    const nextVideo = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % projects.length);
    }, []);

    // Fade in on initial mount
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setVideoOpacity(0.6);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    // Auto-rotate when muted
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isMuted) {
            timer = setInterval(nextVideo, AUTO_ROTATE_TIME * 1000);
        }
        return () => clearInterval(timer);
    }, [isMuted, activeIndex, nextVideo]);

    // Handle smooth source transitions
    useEffect(() => {
        if (activeIndex === displayIndex) return;

        const nextSrc = projects[activeIndex].video;
        const currentSrc = projects[displayIndex].video;

        if (nextSrc === currentSrc) {
            // Seamless transition: Video remains playing, just update text
            setDisplayIndex(activeIndex);
            return;
        }

        // Step 1: Fade out for new video
        const frame = requestAnimationFrame(() => {
            setVideoOpacity(0);
        });

        // Step 2: After fade-out, swap displayIndex to change source
        const timer = setTimeout(() => {
            setDisplayIndex(activeIndex);
        }, 500); // 500ms fade-out

        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
        };
    }, [activeIndex, displayIndex]);

    useEffect(() => {
        if (videoRef.current) {
            const currentSrc = projects[displayIndex].video;

            // Only reload the video element if the source URL actually changed
            if (lastLoadedSrc.current !== currentSrc) {
                lastLoadedSrc.current = currentSrc;
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
            }
            
            // Step 3: Fade back in
            const frame = requestAnimationFrame(() => {
                setVideoOpacity(0.6);
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [displayIndex]);

    const handleVideoEnd = () => {
        if (!isMuted) {
            nextVideo();
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current && !isMuted) {
            setVideoDuration(videoRef.current.duration);
        } else {
            setVideoDuration(AUTO_ROTATE_TIME);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full z-10 overflow-hidden">
            {/* Dark gradient overlays */}
            <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-[#15110f80] to-transparent h-[30rem]" />
            <div className="absolute bottom-0 left-0 w-full z-[2] pointer-events-none bg-gradient-to-t from-[#15110f] via-[#15110f]/80 to-transparent h-[30rem]" />

            {/* Background Video — uses CSS transition instead of framer-motion */}
            <div className="absolute inset-0 z-[1] w-full h-full">
                <video
                    ref={videoRef}
                    style={{
                        opacity: videoOpacity,
                        transition: 'opacity 0.5s ease-in-out',
                    }}
                    autoPlay
                    loop={isMuted}
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onEnded={handleVideoEnd}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="w-full h-full object-cover will-change-[opacity]"
                    src={projects[displayIndex].video}
                />
            </div>

            {/* Unified Bottom Section */}
            <div className="absolute bottom-[2rem] md:bottom-[4rem] left-0 w-full px-[1.5rem] md:px-[5rem] z-[50] flex flex-col gap-10 md:gap-14 pointer-events-none">

                {/* Top Row: Category (Left) and Mute (Right) */}
                <div className="flex justify-between items-end w-full">
                    {/* 1. Left: Active Category (One by One) */}
                    <div className="flex flex-col gap-4 w-[75%] md:w-[40%] pointer-events-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col gap-3"
                            >
                                <div className="w-[100px] md:w-[150px] h-[2px] bg-white/10 relative overflow-hidden">
                                    <motion.div
                                        key={activeIndex + isMuted.toString()}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: videoDuration, ease: "linear" }}
                                        className="absolute top-0 left-0 h-full bg-[#f16920]"
                                    />
                                </div>
                                <h2 className="font-monument text-[11px] md:text-[14px] tracking-widest text-white uppercase leading-tight">
                                    {projects[activeIndex].title}
                                </h2>
                                <p className="font-sans font-medium text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                                    {projects[activeIndex].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 2. Right: Mute/Unmute Toggle */}
                    <div className="flex justify-end items-center pointer-events-auto">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex items-center gap-3 group"
                        >
                            <span className="font-monument text-[9px] tracking-[0.3em] text-white/50 group-hover:text-brand-orange transition-colors hidden md:inline">
                                {isMuted ? "SOUND OFF" : "SOUND ON"}
                            </span>
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:border-brand-orange group-hover:text-brand-orange transition-all bg-white/5 backdrop-blur-sm">
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Premium Watermark Branding */}
                <div className="w-full text-center pointer-events-none px-4 mt-auto">
                    <h1 className="font-monument text-[4vw] md:text-[6vw] tracking-tighter uppercase whitespace-nowrap leading-none select-none opacity-[0.7] md:opacity-[0.7] text-white">
                        THE SIMPLE KREW<span className="text-[#f16920]">.</span>
                    </h1>
                </div>
            </div>
        </div>
    );
}
