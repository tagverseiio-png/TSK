import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NoiseOverlayWrapper from "@/components/NoiseOverlayWrapper";
import NavigationWrapper from "@/components/NavigationWrapper";

import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Simple Krew | Premium Marketing Authority",
  description: "We engineer growth for brands that refuse to blend in. Operating in Singapore, Malaysia, and India.",
  keywords: ["Marketing Agency", "Brand Engineering", "Growth Strategy", "TSK", "The Simple Krew"],
  authors: [{ name: "The Simple Krew" }],
  openGraph: {
    title: "The Simple Krew | Premium Marketing Authority",
    description: "We engineer growth for brands that refuse to blend in.",
    url: "https://thesimplekrew.com",
    siteName: "The Simple Krew",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Simple Krew",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Simple Krew | Premium Marketing Authority",
    description: "We engineer growth for brands that refuse to blend in.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-brand-black text-brand-white selection:bg-brand-orange selection:text-white overflow-x-hidden min-h-screen" suppressHydrationWarning>
        <SmoothScroll>
          <NoiseOverlayWrapper />
          <NavigationWrapper />
          <main className="relative z-10 w-full h-full">
            {children}
          </main>
        </SmoothScroll>
      </body>
    </html>
  );
}
