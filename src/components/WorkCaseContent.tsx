"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { MediaItem } from "@/components/MediaGallery";

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
    // Background image for the media section
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

    const handleDragEnd = (event: any, info: any) => {
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
        const interval = setInterval(nextSlide, 4500);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    return (
        <div className="relative w-full overflow-hidden">
            {/* ─── HERO SECTION ─── */}
            <section className="relative min-h-[80vh] flex flex-col justify-center px-6 md:px-[8rem] pt-[15vh] pb-16">
                {/* Background number */}
                <div className="absolute right-[5vw] top-[10%] md:top-[20%] font-monument text-white/[0.03] text-[35vw] md:text-[25vw] font-bold leading-none pointer-events-none select-none z-0">
                    {study.number}
                </div>

                {/* Category + Year */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center gap-3 mb-8 relative z-10"
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
                    className="font-monument font-bold text-[15vw] md:text-[9vw] uppercase leading-[0.85] tracking-tight text-white relative z-10 mb-8"
                >
                    {study.name.split(" ").map((word, i) => (
                        <div key={i}>{word}</div>
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
            <section className="relative w-full min-h-screen py-24 md:py-32 px-6 md:px-[8rem] flex items-center overflow-hidden">
                {/* SUBTLE BACKGROUND IMAGE */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ 
                        backgroundImage: `url(${study.bgImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2000'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-[#0D0D0D] opacity-[0.94]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#15110f] via-transparent to-[#0D0D0D]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-[80px] items-center w-full relative z-10">
                    
                    {/* ── LEFT COLUMN: Text Content & Captions ── */}
                    <div className="flex flex-col gap-10">
                        {/* Hero Tagline / Statement */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="w-12 h-[2px] bg-brand-orange mb-8" />
                            <h2 className="text-white text-[20px] md:text-[24px] lg:text-[28px] leading-[1.2] tracking-tight font-monument uppercase">
                                {study.heroTagline.split(" ").slice(0, 4).join(" ")}
                                <br />
                                <span className="text-brand-orange">{study.heroTagline.split(" ").slice(4).join(" ")}</span>
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
                        className="relative group w-full aspect-[4/5] md:aspect-[3/2] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_120px_rgba(0,0,0,0.9)] cursor-ns-resize"
                        onWheel={handleWheel}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0 w-full h-full"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                            >
                                {study.media[currentIndex].type === "image" ? (
                                    <img
                                        src={study.media[currentIndex].src}
                                        alt={study.media[currentIndex].caption}
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black relative">
                                        <iframe
                                            src={`https://drive.google.com/file/d/${study.media[currentIndex].src}/preview`}
                                            className="w-full h-full pointer-events-none"
                                            style={{ border: "none" }}
                                            allow="autoplay; encrypted-media"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="w-20 h-20 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                                                <Play className="w-10 h-10 text-white/50" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Overlay */}
                        <div className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10 flex items-center justify-between z-20">
                            {/* Dot Indicators */}
                            <div className="flex gap-2">
                                {study.media.map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-[1px] transition-all duration-500 ${currentIndex === i ? 'w-10 bg-brand-orange' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            {/* Prev/Next Buttons */}
                            <div className="flex gap-4">
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
