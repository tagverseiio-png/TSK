"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });

export default function LoadingScreenWrapper({ children }: { children: React.ReactNode }) {
    const [showLoader, setShowLoader] = useState(false);
    const [loaderDone, setLoaderDone] = useState(false);

    useEffect(() => {
        // Only show on first visit per session
        const seen = sessionStorage.getItem("tsk_loaded");
        if (!seen) {
            setShowLoader(true);
        } else {
            setLoaderDone(true);
        }
    }, []);

    const handleComplete = () => {
        sessionStorage.setItem("tsk_loaded", "1");
        setLoaderDone(true);
        // Keep showLoader true so AnimatePresence can play exit
        setTimeout(() => setShowLoader(false), 1000);
    };

    return (
        <>
            {showLoader && <LoadingScreen onComplete={handleComplete} />}
            {/* Children become visible after loader */}
            <div
                style={{
                    opacity: loaderDone ? 1 : 0,
                    transition: "opacity 0.6s ease 0.1s",
                    minHeight: "100vh",
                }}
            >
                {children}
            </div>
        </>
    );
}
