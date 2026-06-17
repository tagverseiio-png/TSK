"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.back()} 
      className="fixed top-28 md:top-32 left-4 md:left-[2.5rem] z-[60] inline-flex items-center gap-2 text-white/50 hover:text-brand-orange transition-colors font-monument text-[10px] tracking-widest uppercase bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back
    </button>
  );
}
