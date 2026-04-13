"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navigation() {
    const pathname = usePathname();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [rotatingIndex, setRotatingIndex] = useState(0);

    const navLinks = [
        { name: "SERVICES", href: "/services" },
        { name: "WORK", href: "/work" },
        { name: "STUDIO", href: "/studio" },
        { name: "CONTACT", href: "/contact" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Rotating label for mobile
    useEffect(() => {
        if (!isMenuOpen) {
            const interval = setInterval(() => {
                setRotatingIndex((prev) => (prev + 1) % navLinks.length);
            }, 3000); // Rotate every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            className="fixed top-0 left-0 w-full z-[100] p-6 md:p-[2.5rem] flex justify-between items-center mix-blend-difference text-white uppercase font-monument text-[13px] font-bold tracking-[0.8px] leading-[1.3]"
        >
            {/* Gradient backdrop */}
            <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-b from-black/20 to-transparent pointer-events-none -z-10 mix-blend-normal opacity-50 transition-opacity duration-300" />

            {/* Mobile Navigation (Rotating Text Dropdown) */}
            <div className="md:hidden relative z-[110]">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex flex-col items-start gap-1 p-2"
                >
                    <AnimatePresence mode="wait">
                        {!isMenuOpen ? (
                            <motion.span
                                key={rotatingIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[12px] tracking-[0.1em]"
                            >
                                {navLinks[rotatingIndex].name}
                                <span className="ml-2 text-[8px] opacity-50">▼</span>
                            </motion.span>
                        ) : (
                            <motion.span
                                key="close"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[12px] tracking-[0.1em] text-brand-orange"
                            >
                                CLOSE [X]
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 mt-4 flex flex-col gap-6 p-4 backdrop-blur-xl bg-black/40 rounded-lg min-w-[200px] border border-white/10"
                        >
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[16px] tracking-widest ${pathname === link.href ? 'text-brand-orange' : 'text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 w-full">
                <Link href="/services" className={`hover:opacity-100 transition-opacity ${pathname === '/services' ? 'opacity-100' : 'opacity-50'}`}>
                    SERVICES
                </Link>
                <Link href="/work" className={`hover:opacity-100 transition-opacity ${pathname === '/work' ? 'opacity-100' : 'opacity-50'}`}>
                    WORK
                </Link>

                <motion.div 
                    initial={{ x: "80vw", opacity: 0 }}
                    animate={{ x: isLoaded ? 0 : "80vw", opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                    className="flex gap-8"
                >
                    <Link href="/studio" className={`hover:opacity-100 transition-opacity ${pathname === '/studio' ? 'opacity-100' : 'opacity-50'}`}>
                        STUDIO
                    </Link>
                    <Link href="/contact" className={`hover:opacity-100 transition-opacity ${pathname === '/contact' ? 'opacity-100' : 'opacity-50'}`}>
                        CONTACT
                    </Link>
                </motion.div>
            </div>

            {/* Logo Section */}
            <div className="flex justify-end w-auto md:w-[20rem]">
                <motion.div
                    initial={{ 
                        x: "-40vw", 
                        y: "40vh", 
                        scale: 2.5,
                        opacity: 0 
                    }}
                    animate={{ 
                        x: isLoaded ? 0 : "-40vw", 
                        y: isLoaded ? 0 : "40vh", 
                        scale: isLoaded ? 1 : 2.5,
                        opacity: 1
                    }}
                    transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                >
                    <Link href="/">
                        <img 
                            src="/IMG-20250512-WA0010-removebg-preview.png" 
                            alt="TSK Logo" 
                            className="w-[4.5rem] md:w-[7.5rem] h-auto invert brightness-200"
                        />
                    </Link>
                </motion.div>
            </div>

            {/* Global Blur Backdrop when menu is open */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] pointer-events-none"
                    />
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
