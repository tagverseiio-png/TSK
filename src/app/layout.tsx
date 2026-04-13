import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NoiseOverlayWrapper from "@/components/NoiseOverlayWrapper";
import NavigationWrapper from "@/components/NavigationWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Simple Krew | Premium Marketing Authority",
  description: "We engineer growth for brands that refuse to blend in. Operating in Singapore, Malaysia, and India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased bg-brand-black text-brand-white selection:bg-brand-orange selection:text-white overflow-x-hidden min-h-screen">
        <NoiseOverlayWrapper />
        <NavigationWrapper />
        <main className="relative z-10 w-full h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
