"use client";

import { usePathname } from "next/navigation";
import NoiseOverlay from "@/components/NoiseOverlay";

export default function NoiseOverlayWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <NoiseOverlay />;
}
