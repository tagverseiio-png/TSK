"use client";

import { motion } from "framer-motion";

export default function Watermark() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.03 }}
                transition={{ duration: 2 }}
                className="font-monument text-[25vw] leading-none text-white select-none whitespace-nowrap"
            >
                THE SIMPLE KREW
            </motion.div>
        </div>
    );
}
