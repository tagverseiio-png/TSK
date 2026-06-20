"use client";

import React, { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;              // Standard compressed URL (fallback)
  srcHigh?: string;         // 1280p variant
  srcLow?: string;          // 720p variant  
  poster?: string;          // WebP poster frame
  hlsUrl?: string;          // HLS master playlist
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

export default function VideoPlayer({
  src,
  srcHigh,
  srcLow,
  poster,
  hlsUrl,
  className = "",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const selectMp4Fallback = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768 && srcLow) {
          return srcLow;
        }
        if (srcHigh) {
          return srcHigh;
        }
      }
      return src;
    };

    const video = videoRef.current;
    if (!video) return;

    if (hlsUrl) {
      let hls: InstanceType<typeof import("hls.js").default> | null = null;

      // 1. Check native Safari/iOS support
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) video.play().catch(e => console.warn("Native HLS autoplay failed", e));
        });
      } else {
        // 2. Dynamic import hls.js for Chrome/Firefox/etc.
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              hls = new Hls({
                startLevel: -1, 
                capLevelToPlayerSize: false
              });
              hls.loadSource(hlsUrl);
              hls.attachMedia(video);
              
              hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                // Force highest quality level immediately
                if (data.levels && data.levels.length > 0) {
                  hls!.currentLevel = data.levels.length - 1;
                }
                if (autoPlay) {
                  video.play().catch(e => console.warn("HLS.js autoplay failed", e));
                }
              });

              hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean }) => {
                if (data.fatal) {
                  console.warn("HLS fatal error, falling back to MP4:", data);
                  setUseFallback(true);
                  video.src = selectMp4Fallback();
                  if (autoPlay) video.play().catch(e => console.warn("Fallback autoplay failed", e));
                }
              });
            } else {
              console.warn("HLS.js not supported, falling back to MP4");
              setUseFallback(true);
              video.src = selectMp4Fallback();
              if (autoPlay) video.play().catch(e => console.warn("Fallback autoplay failed", e));
            }
          })
          .catch((err) => {
            console.error("Failed to load hls.js, falling back to MP4:", err);
            setUseFallback(true);
            video.src = selectMp4Fallback();
            if (autoPlay) video.play().catch(e => console.warn("Fallback autoplay failed", e));
          });
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else {
      setUseFallback(true);
      video.src = selectMp4Fallback();
      if (autoPlay) video.play().catch(e => console.warn("Fallback autoplay failed", e));
    }
  }, [hlsUrl, src, srcHigh, srcLow, autoPlay]);

  // Adjust source on window resize if playing MP4 fallback
  useEffect(() => {
    if (!useFallback) return;

    const handleResize = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentSrc = video.src;
      let targetSrc = src;

      if (window.innerWidth < 768 && srcLow) {
        targetSrc = srcLow;
      } else if (srcHigh) {
        targetSrc = srcHigh;
      }

      if (targetSrc && !currentSrc.endsWith(targetSrc)) {
        const currentTime = video.currentTime;
        const isPaused = video.paused;
        video.src = targetSrc;
        video.load();
        
        video.currentTime = currentTime;
        if (!isPaused) {
          video.play().catch((err) => console.log("Auto-resume playback prevented:", err));
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [useFallback, src, srcHigh, srcLow]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsLoading(false);
    }
  }, [src, hlsUrl, useFallback]);

  // Sync play/pause state for external controls (like hovering or toggling)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.src) return;

    if (autoPlay) {
      // Only call play if it's paused to avoid AbortError on initial load
      if (video.paused && video.readyState >= 2) {
        video.play().catch(e => console.warn("Play interrupted", e));
      }
    } else {
      video.pause();
    }
  }, [autoPlay]);

  return (
    <div className={`relative overflow-hidden bg-[#0D0D0D] ${className}`}>
      {/* Premium Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0D0D0D] transition-opacity duration-500">
          <div className="w-12 h-12 md:w-16 md:h-16 relative">
            <div className="absolute inset-0 border-[3px] border-white/5 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-brand-orange rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="font-monument text-[8px] md:text-[10px] tracking-[4px] text-brand-orange/80 uppercase mt-6 animate-pulse">
            Loading Media
          </span>
        </div>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        crossOrigin="anonymous"
        preload="metadata"
        controlsList="nodownload"
        onLoadStart={() => setIsLoading(true)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => setIsLoading(false)}
      />
    </div>
  );
}
