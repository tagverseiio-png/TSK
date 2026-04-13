"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div
            className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col justify-center bg-brand-black"
            onMouseMove={handleMouseMove}
        >
            {hoveredIdx !== null && (
                <motion.div
                    className="pointer-events-none fixed top-0 left-0 w-[400px] h-[550px] overflow-hidden rounded-xl shadow-2xl z-0"
                    animate={{
                        x: mousePos.x - 200,
                        y: mousePos.y - 275,
                        opacity: 1,
                        scale: 1,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    <img
                        src={directors[hoveredIdx].image}
                        alt={directors[hoveredIdx].name}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </motion.div>
            )}

            <div className="relative z-10 flex flex-col items-start space-y-2 md:space-y-4">
                {directors.map((dir, idx) => (
                    <motion.div
                        key={dir.id}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="group cursor-pointer"
                    >
                        <h2 className={`text-5xl md:text-8xl lg:text-[7vw] font-bold tracking-tighter transition-all duration-300 mix-blend-difference ${hoveredIdx === idx ? 'text-brand-orange pl-8' : 'text-brand-white'}`}>
                            {dir.name}
                        </h2>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
