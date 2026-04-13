"use client";

import { motion } from "framer-motion";
import { BarChart3, ExternalLink, Users } from "lucide-react";

const clientNames = [
    "A Star Motors",
    "Ammakase",
    "Best Perfume",
    "Capital Insight",
    "Chuan Watch",
    "Diamond Pearl",
    "DNet",
    "Erodu Amman Mess",
    "Evoque Medical",
    "Game Hub",
    "GOA Night Club",
    "Krewpod Studio",
    "Mix Masters Club",
    "Sooraa",
    "Sree Laxmi Vilas",
    "STR8UP",
    "Super Deluxe Kitchen",
];

export default function WorkBonus() {
    return (
        <div className="bg-[#15110f] relative z-30">
            {/* ── DIVIDER ── */}
            <div className="w-full px-6 md:px-[5rem]">
                <div className="w-full h-[1px] bg-white/10" />
            </div>

            {/* ── CLIENT ANALYTICS SECTION ── */}
            <section className="px-6 md:px-[5rem] py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-8"
                >
                    {/* Header */}
                    <div className="flex items-start gap-4 md:gap-6">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <BarChart3 className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                            <h2 className="font-monument font-bold text-[7vw] md:text-[3.5vw] uppercase leading-[0.95] tracking-tight text-white mb-3">
                                Our Client Analytics
                            </h2>
                            <p className="text-white/40 text-[12px] md:text-[14px] tracking-wide max-w-[500px] leading-relaxed">
                                Account Growth & Strategy Optimization — Real numbers. Real growth.
                            </p>
                        </div>
                    </div>

                    {/* Drive folder embed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full"
                    >
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                            {/* Ornamental corners */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand-orange/30 z-10" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-brand-orange/30 z-10" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-brand-orange/30 z-10" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand-orange/30 z-10" />

                            <iframe
                                src="https://drive.google.com/embeddedfolderview?id=1Ucv7A4UuOGqwLJwyudfgk6eJfUP1et8w#grid"
                                className="w-full h-full"
                                style={{ border: "none" }}
                                allowFullScreen
                            />
                        </div>

                        <a
                            href="https://drive.google.com/drive/folders/1Ucv7A4UuOGqwLJwyudfgk6eJfUP1et8w"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-3 text-brand-orange text-[10px] md:text-[11px] font-monument tracking-[2px] uppercase hover:gap-5 transition-all duration-300 group"
                        >
                            <span>View Analytics Screenshots</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── DIVIDER ── */}
            <div className="w-full px-6 md:px-[5rem]">
                <div className="w-full h-[1px] bg-white/10" />
            </div>

            {/* ── OUR CLIENTS SECTION ── */}
            <section className="px-6 md:px-[5rem] py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-12"
                >
                    {/* Header */}
                    <div className="flex items-start gap-4 md:gap-6">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Users className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                            <h2 className="font-monument font-bold text-[7vw] md:text-[3.5vw] uppercase leading-[0.95] tracking-tight text-white mb-3">
                                Our Clients
                            </h2>
                            <p className="text-white/40 text-[12px] md:text-[14px] tracking-wide max-w-[500px] leading-relaxed">
                                Trusted by brands across Singapore, Malaysia & India.
                            </p>
                        </div>
                    </div>

                    {/* Client names grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-5">
                        {clientNames.map((name, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.04 }}
                                className="flex items-center gap-3 group cursor-default"
                            >
                                <span className="w-1 h-1 rounded-full bg-brand-orange/40 group-hover:bg-brand-orange transition-colors duration-300 flex-shrink-0" />
                                <span className="text-white/50 text-[11px] md:text-[12px] tracking-wide group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                                    {name}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Logos drive link */}
                    <a
                        href="https://drive.google.com/drive/folders/1Wocjf5mQxw6WgA3SV96bnlCrQDIcvRDg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-brand-orange text-[10px] md:text-[11px] font-monument tracking-[2px] uppercase hover:gap-5 transition-all duration-300 group"
                    >
                        <span>View Client Logos</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                    </a>
                </motion.div>
            </section>

            {/* ── FOOTER TAGLINE ── */}
            <div className="w-full px-6 md:px-[5rem] pb-16">
                <div className="w-full h-[1px] bg-white/10 mb-8" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <p className="text-white/20 text-[10px] md:text-[11px] font-monument tracking-[2px] uppercase">
                        TSK — Where vision becomes visual authority.
                    </p>
                    <p className="text-white/15 text-[9px] md:text-[10px] tracking-wider">
                        © 2024 The Simple Krew. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
