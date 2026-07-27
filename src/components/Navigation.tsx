"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { m as motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navigation() {
    const pathname = usePathname();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [rotatingIndex, setRotatingIndex] = useState(0);
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
            setIsMenuOpen(false);
        } else {
            setHidden(false);
        }
    });

    const navLinks = [
        { name: "SERVICES", href: "/services" },
        { name: "WORK", href: "/work" },
        { name: "STUDIO", href: "/studio" },
        { name: "CONTACT", href: "/contact" },
    ];

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Rotating label for mobile
    useEffect(() => {
        if (!isMenuOpen) {
            const interval = setInterval(() => {
                setRotatingIndex((prev) => (prev + 1) % navLinks.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" }
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full z-[100] h-[80px] md:h-[100px] px-6 md:px-[64px] lg:px-[80px] flex justify-between items-center border-b border-white/10 text-white uppercase font-monument text-[12px] md:text-[13px] font-bold tracking-[1px] leading-[1.3]"
            style={{ backgroundColor: 'transparent' }}
        >
            {/* Mobile Navigation (Rotating Text Dropdown) */}
            <div className="md:hidden relative z-[110]">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex flex-col items-start gap-1 py-2 pr-4"
                >
                    <AnimatePresence mode="wait">
                        {!isMenuOpen ? (
                            <motion.span
                                key={rotatingIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="tracking-widest"
                            >
                                {navLinks[rotatingIndex].name}
                                <span className="ml-2 text-[8px] opacity-50">▼</span>
                            </motion.span>
                        ) : (
                            <motion.span
                                key="close"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="tracking-widest text-brand-orange"
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
                            className="absolute top-full left-0 mt-4 flex flex-col gap-6 p-6 bg-[#15110f] rounded-lg min-w-[200px] border border-white/10 shadow-2xl"
                        >
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    className={`tracking-widest transition-colors ${pathname === link.href ? 'text-brand-orange' : 'text-white hover:text-brand-orange/80'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Navigation - Left Aligned */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12 w-full">
                {navLinks.map((link, index) => (
                    <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link 
                            href={link.href} 
                            className={`hover:text-brand-orange transition-colors duration-300 ${pathname === link.href ? 'text-brand-orange' : 'text-white'}`}
                        >
                            {link.name}
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Logo Section - Far Right */}
            <div className="flex justify-end w-auto min-w-[100px] relative z-[110]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    <Link href="/">
                        <Image 
                            src="/IMG-20250512-WA0010-removebg-preview.png" 
                            alt="TSK Logo"
                            width={120}
                            height={60}
                            className="w-[4.5rem] md:w-[6.5rem] lg:w-[7.5rem] h-auto invert brightness-200 hover:opacity-80 transition-opacity"
                            priority
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] pointer-events-none"
                    />
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
