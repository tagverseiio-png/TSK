"use client";

import React from "react";

export default function ExploreButton() {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById("explore");
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <a 
            href="#explore" 
            onClick={handleScroll}
            className="inline-flex items-center gap-2 font-space font-bold text-base md:text-lg text-[#15110f] bg-white px-6 md:px-8 py-3 md:py-4 hover:bg-brand-orange hover:text-white transition-colors duration-300 cursor-pointer"
        >
            ↓ Explore Service
        </a>
    );
}
