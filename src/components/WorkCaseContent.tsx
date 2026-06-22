"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { m as motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

interface MediaItem {
    type: 'image' | 'video';
    src: string;
    caption?: string;
    poster?: string;
    srcHigh?: string;
    srcLow?: string;
    hlsUrl?: string;
}

interface StudyData {
    name: string;
    category: string;
    year: string;
    tagline: string;
    description: string;
    heroTagline: string;
    services: string[];
    driveFolder: string;
    number: string;
    media: MediaItem[];
    bgImage?: string;
}

interface WorkCaseContentProps {
    study: StudyData;
    slug: string;
    nextSlug: string;
    nextStudyName: string;
}

export default function WorkCaseContent({
    study,
    slug,
    nextSlug,
    nextStudyName,
}: WorkCaseContentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isScrolling, setIsScrolling] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % study.media.length);
    }, [study.media.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + study.media.length) % study.media.length);
    }, [study.media.length]);

    // Handle mouse wheel on slideshow box with debounce/cooldown
    const handleWheel = (e: React.WheelEvent) => {
        if (isScrolling) return;

        if (Math.abs(e.deltaY) > 30) {
            setIsScrolling(true);
            if (e.deltaY > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            setIsAutoPlaying(false);
            
            // Cooldown to prevent scroll spam
            setTimeout(() => setIsScrolling(false), 800);
            // Resume autoplay after long period of inactivity
            setTimeout(() => setIsAutoPlaying(true), 15000);
        }
    };

    const handleDragEnd = (event: unknown, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
            nextSlide();
        } else if (info.offset.x > threshold) {
            prevSlide();
        }
        setIsAutoPlaying(false);
    };

    // Auto slideshow logic
    useEffect(() => {
        if (!isAutoPlaying) return;

        // Do not auto-advance if the current item is a video, 
        // to prevent interrupting playback.
        if (study.media[currentIndex]?.type === 'video') {
            return; 
        }

        const interval = setInterval(nextSlide, 4500);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, currentIndex, study.media]);

    return (
        <div className="relative w-full overflow-x-hidden">
            {/* ─── HERO SECTION ─── */}
            <section className="relative min-h-[80vh] flex flex-col justify-center pl-16 pr-6 md:px-[8rem] pt-[15vh] pb-16">
                {/* Background number */}
                <div className="absolute right-[5vw] top-[10%] md:top-[20%] font-monument text-white/[0.03] text-[35vw] md:text-[25vw] font-bold leading-none pointer-events-none select-none z-0 will-change-transform">
                    {study.number}
                </div>

                {/* Category + Year */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center gap-3 mb-8 relative z-10 will-change-[transform,opacity]"
                >
                    <span className="text-brand-orange text-[10px] md:text-[11px] font-monument font-bold tracking-[3px] uppercase">
                        {study.category}
                    </span>
                    <span className="w-6 h-[1px] bg-white/20" />
                    <span className="text-white/30 text-[10px] md:text-[11px] font-monument tracking-[2px]">
                        {study.year}
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="font-monument font-bold text-[11.5vw] md:text-[9vw] uppercase leading-[0.85] tracking-tight text-white relative z-10 mb-8 will-change-[transform,opacity] flex flex-col gap-2"
                >
                    {study.name.split(" ").map((word, i) => (
                        <div key={i} className="break-words break-all max-w-full">{word}</div>
                    ))}
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-white/40 text-[12px] md:text-[14px] tracking-wide max-w-[550px] leading-relaxed relative z-10"
                >
                    {study.tagline}
                </motion.p>
            </section>

            {/* ─── MAIN SLIDESHOW SECTION ─── */}
            <section className="relative w-full min-h-screen py-24 md:py-32 pl-14 pr-6 md:px-[8rem] flex items-center overflow-hidden">
                {/* SUBTLE BACKGROUND IMAGE */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <Image
                        src={study.bgImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2000'}
                        alt="Background"
                        fill
                        className="object-cover opacity-[0.10] scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#0D0D0D] opacity-[0.94]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#15110f] via-transparent to-[#0D0D0D]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-[80px] items-center w-full relative z-10">
                    
                    {/* ── LEFT COLUMN: Text Content & Captions ── */}
                    <div className="flex flex-col gap-10 max-w-full overflow-hidden">
                        {/* Hero Tagline / Statement */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="will-change-[transform,opacity] max-w-full"
                        >
                            <div className="w-12 h-[2px] bg-brand-orange mb-8" />
                            <h2 className="text-white text-[16px] sm:text-[18px] md:text-[24px] lg:text-[28px] leading-[1.3] md:leading-[1.2] tracking-tight font-monument uppercase break-words w-full hyphens-auto">
                                {study.heroTagline.split(" ").slice(0, 4).join(" ")}
                                <br className="hidden md:block" />
                                <span className="text-brand-orange ml-1 md:ml-0">{study.heroTagline.split(" ").slice(4).join(" ")}</span>
                            </h2>
                        </motion.div>

                        {/* Description */}
                        <div className="max-w-[480px]">
                            <h3 className="font-monument text-white/50 text-[10px] tracking-[3px] uppercase mb-4">
                                Strategic Impact
                            </h3>
                            <p className="text-white/60 text-[14px] md:text-[15px] leading-[1.8] tracking-wide">
                                {study.description}
                            </p>
                        </div>

                        {/* Interactive Media Breakdown */}
                        <div className="flex flex-col gap-2 md:gap-4 mt-4">
                            <h3 className="font-monument text-white/50 text-[10px] tracking-[3px] uppercase mb-4">
                                Media Breakdown
                            </h3>
                            {study.media.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setCurrentIndex(i);
                                        setIsAutoPlaying(false);
                                    }}
                                    className={`text-left transition-all duration-500 group flex items-start gap-4 py-2 relative overflow-hidden ${
                                        currentIndex === i 
                                            ? "text-white opacity-100" 
                                            : "text-white/20 hover:text-white/40"
                                    }`}
                                >
                                    <div className={`mt-3 h-[1px] transition-all duration-700 ${currentIndex === i ? 'w-10 bg-brand-orange' : 'w-0 group-hover:w-6 bg-white/40'}`} />
                                    <span className={`text-[11px] md:text-[12px] font-monument tracking-[2.5px] uppercase transition-all duration-500 ${currentIndex === i ? 'translate-x-0' : 'translate-x-[-10px]'}`}>
                                        {item.caption}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Single Picture Slideshow ── */}
                    <div 
                        className="relative group w-full h-[60vh] md:h-[70vh] lg:h-[75vh] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_120px_rgba(0,0,0,0.9)] cursor-ns-resize"
                        onWheel={handleWheel}
                    >
                        {/* Render all media items in the DOM so they buffer in the background instantly! */}
                        {study.media.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={false}
                                animate={{ opacity: currentIndex === index ? 1 : 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="absolute inset-0 w-full h-full"
                                style={{ pointerEvents: currentIndex === index ? "auto" : "none" }}
                                drag={currentIndex === index ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                            >
                                {item.type === "image" ? (
                                    <Image
                                        src={item.src}
                                        alt={item.caption || ''}
                                        fill
                                        className="w-full h-full object-cover will-change-transform"
                                        priority={currentIndex === index}
                                        loading={currentIndex === index ? "eager" : "lazy"}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black relative">
                                        {(!item.src.startsWith("http") && !item.src.startsWith("/") && !item.src.includes(".")) ? (
                                            <VideoPlayer
                                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/works/drive-stream/${item.src}`}
                                                className="w-full h-full object-cover"
                                                controls
                                                autoPlay={currentIndex === index}
                                                muted
                                            />
                                        ) : (
                                            <VideoPlayer
                                                src={item.src}
                                                srcHigh={item.srcHigh}
                                                srcLow={item.srcLow}
                                                poster={item.poster}
                                                hlsUrl={item.hlsUrl}
                                                className="w-full h-full object-cover"
                                                controls
                                                autoPlay={currentIndex === index}
                                                muted
                                            />
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Navigation Overlay */}
                        <div className="absolute bottom-32 md:bottom-24 left-6 right-6 md:left-10 md:right-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 z-20 pointer-events-none">
                            {/* Dot Indicators */}
                            <div className="flex flex-wrap gap-2 pointer-events-auto max-w-[80%] md:max-w-none">
                                {study.media.map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-[1.5px] transition-all duration-500 ${currentIndex === i ? 'w-8 md:w-10 bg-brand-orange' : 'w-3 md:w-4 bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            {/* Prev/Next Buttons */}
                            <div className="flex gap-4 self-end md:self-auto pointer-events-auto shrink-0">
                                <button 
                                    onClick={prevSlide}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-md hover:bg-brand-orange hover:border-brand-orange transition-all duration-500"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button 
                                    onClick={nextSlide}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-md hover:bg-brand-orange hover:border-brand-orange transition-all duration-500"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Active Slide Number Overlay */}
                        <div className="absolute top-10 right-10 text-[10px] font-monument text-white/40 tracking-[4px] z-20">
                            {String(currentIndex + 1).padStart(2, '0')} / {String(study.media.length).padStart(2, '0')}
                        </div>

                        {/* Subtle vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* ─── NEXT PROJECT LINK ─── */}
            <section className="px-6 md:px-[8rem] py-24 md:py-32 bg-[#0D0D0D]">
                <Link
                    href={`/work/${nextSlug}`}
                    className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                    <div className="max-w-[85%]">
                        <span className="text-white/30 text-[10px] font-monument tracking-[5px] uppercase block mb-8">
                            Forward Navigation
                        </span>
                        <span className="font-monument font-bold text-[10vw] md:text-[6vw] text-white uppercase leading-[0.85] tracking-tight group-hover:text-brand-orange transition-colors duration-700 block">
                            {nextStudyName}
                        </span>
                    </div>
                    <motion.div
                        className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full border border-white/10 group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-700"
                        whileHover={{ scale: 1.1, rotate: 45 }}
                    >
                        <ArrowRight className="w-12 h-12 text-white" />
                    </motion.div>
                </Link>
            </section>
        </div>
    );
}
