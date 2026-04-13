"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        id: 1,
        title: "Cinematic Reel",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Narrative Stories",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Commercial Work",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop",
    },
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    />
                    {/* Subtle dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 mix-blend-difference text-brand-white z-20">
                <h1 className="text-4xl md:text-8xl lg:text-[10vw] font-bold leading-none tracking-tighter mix-blend-overlay opacity-90">
                    ELECTRA
                </h1>
            </div>

            <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 z-20 flex gap-2">
                {slides.map((slide, idx) => (
                    <div key={slide.id} className="w-12 md:w-24 h-1 bg-white/20 overflow-hidden relative">
                        {idx === currentSlide && (
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="absolute top-0 left-0 h-full bg-brand-orange"
                            />
                        )}
                        {idx < currentSlide && <div className="absolute top-0 left-0 h-full w-full bg-brand-orange" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
