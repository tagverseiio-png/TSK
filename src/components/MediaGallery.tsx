import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export interface MediaItem {
    type: "image" | "video";
    /** Direct image URL, or Google Drive file ID for videos */
    src: string;
    /** Optional caption displayed below the media */
    caption?: string;
}

interface MediaGalleryProps {
    items: MediaItem[];
    /** Max height for the scrollable gallery container */
    maxHeight?: string;
    autoScroll?: boolean;
}

export default function MediaGallery({ items, maxHeight = "85vh", autoScroll = true }: MediaGalleryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (!autoScroll || !scrollRef.current || items.length <= 1) return;

        const container = scrollRef.current;
        let scrollInterval: NodeJS.Timeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
                    // Reset to top smoothly or instantly
                    container.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    container.scrollBy({ top: container.clientHeight * 0.8, behavior: "smooth" });
                }
            }, 4000); // Cycle every 4 seconds
        };

        startAutoScroll();

        // Pause on hover
        const handleMouseEnter = () => clearInterval(scrollInterval);
        const handleMouseLeave = () => startAutoScroll();

        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            clearInterval(scrollInterval);
            container.removeEventListener("mouseenter", handleMouseEnter);
            container.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [autoScroll, items.length]);

    if (!items || items.length === 0) return null;

    return (
        <div
            ref={scrollRef}
            className="w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] custom-gallery-scroll snap-y snap-mandatory"
            style={{ maxHeight }}
        >
            <div className="flex flex-col gap-12 p-6 md:p-8">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="w-full flex flex-col gap-4 snap-center shrink-0"
                    >
                        {item.type === "image" ? (
                            <div className="relative w-full max-w-[95%] mx-auto rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] shadow-2xl">
                                {/* Ornamental corner accents */}
                                <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-brand-orange/20 z-10 pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-brand-orange/20 z-10 pointer-events-none" />

                                <img
                                    src={item.src}
                                    alt={item.caption || `Media ${i + 1}`}
                                    className="w-full max-h-[60vh] object-contain bg-[#15110f]"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video max-w-[95%] mx-auto rounded-xl overflow-hidden bg-black border border-white/[0.04] shadow-2xl">
                                {/* Ornamental corner accents */}
                                <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-brand-orange/20 z-10 pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-brand-orange/20 z-10 pointer-events-none" />

                                <iframe
                                    src={`https://drive.google.com/file/d/${item.src}/preview`}
                                    className="w-full h-full"
                                    style={{ border: "none" }}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    loading="lazy"
                                />

                                {/* Play icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <Play className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Caption */}
                        {item.caption && (
                            <div className="text-center">
                                <span className="text-white/40 text-[10px] md:text-[11px] font-monument tracking-[2px] uppercase bg-white/[0.03] px-3 py-1 rounded-full border border-white/10">
                                    {item.caption}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
