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
      } else {
        // 2. Dynamic import hls.js for Chrome/Firefox/etc.
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              hls = new Hls();
              hls.loadSource(hlsUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean }) => {
                if (data.fatal) {
                  console.warn("HLS fatal error, falling back to MP4:", data);
                  setUseFallback(true);
                  video.src = selectMp4Fallback();
                }
              });
            } else {
              console.warn("HLS.js not supported, falling back to MP4");
              setUseFallback(true);
              video.src = selectMp4Fallback();
            }
          })
          .catch((err) => {
            console.error("Failed to load hls.js, falling back to MP4:", err);
            setUseFallback(true);
            video.src = selectMp4Fallback();
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
    }
  }, [hlsUrl, src, srcHigh, srcLow]);

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

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload="metadata"
      controlsList="nodownload"
    />
  );
}
