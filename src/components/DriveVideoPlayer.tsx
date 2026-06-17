"use client";

import React, { useEffect, useRef, useState } from "react";

interface DriveVideoPlayerProps {
  driveId: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function DriveVideoPlayer({
  driveId,
  className = "",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}: DriveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const res = await fetch(`${API_BASE}/api/works/drive-stream/${driveId}`);
        if (!res.ok) throw new Error("Failed to resolve URL");
        const data = await res.json();
        if (!cancelled && data.url) {
          setVideoUrl(data.url);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [driveId]);

  // Attempt autoplay once the video URL is set
  useEffect(() => {
    if (videoUrl && autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — user will need to tap play
      });
    }
  }, [videoUrl, autoPlay]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/50`}>
        <p className="text-white/40 text-xs font-monument tracking-wider">VIDEO UNAVAILABLE</p>
      </div>
    );
  }

  if (loading || !videoUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/50`}>
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline
      preload="metadata"
      controlsList="nodownload"
    />
  );
}
