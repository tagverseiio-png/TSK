"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const NoiseOverlay = dynamic(() => import("@/components/NoiseOverlay"), { ssr: false });

export default function NoiseOverlayWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <NoiseOverlay />;
}
