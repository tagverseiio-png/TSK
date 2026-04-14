export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15110f]">
      <div className="flex flex-col items-center gap-6">
        {/* Simple elegant spinner based on existing brand aesthetics */}
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
        </div>
        <div className="font-monument text-[10px] text-white/40 tracking-[4px] uppercase animate-pulse">
            Loading
        </div>
      </div>
    </div>
  );
}
