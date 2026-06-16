"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

const directors = [
    { id: 1, name: "Jordan Peele", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop" },
    { id: 2, name: "Denis Villeneuve", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop" },
    { id: 3, name: "Christopher Nolan", image: "https://images.unsplash.com/photo-1579248512140-5e3ecbcbf3bb?q=80&w=1000&auto=format&fit=crop" },
    { id: 4, name: "Greta Gerwig", image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1000&auto=format&fit=crop" },
    { id: 5, name: "Bong Joon-ho", image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1000&auto=format&fit=crop" },
];

export default function DirectorsList() {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    // Use RAF-throttled mouse tracking instead of setState on every pixel
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (imgRef.current) {
            imgRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 275}px)`;
        }
    }, []);

    return (
        <div
            className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col justify-center bg-brand-black"
            onMouseMove={handleMouseMove}
        >
            {hoveredIdx !== null && (
                <div
                    ref={imgRef}
                    className="pointer-events-none fixed top-0 left-0 w-[400px] h-[550px] overflow-hidden rounded-xl shadow-2xl z-0 transition-opacity duration-300"
                    style={{ opacity: 1 }}
                >
                    <img
                        src={directors[hoveredIdx].image}
                        alt={directors[hoveredIdx].name}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            )}

            <div className="relative z-10 flex flex-col items-start space-y-2 md:space-y-4">
                {directors.map((dir, idx) => (
                    <div
                        key={dir.id}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="group cursor-pointer"
                    >
                        <h2 className={`text-5xl md:text-8xl lg:text-[7vw] font-bold tracking-tighter transition-all duration-300 ${hoveredIdx === idx ? 'text-brand-orange pl-8' : 'text-brand-white'}`}>
                            {dir.name}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
}
