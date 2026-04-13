"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function NavigationWrapper() {
  const pathname = usePathname();
  // Hide the public nav on all admin routes
  if (pathname?.startsWith("/admin")) return null;
  return <Navigation />;
}
