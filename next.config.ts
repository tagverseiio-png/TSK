import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'https', hostname: 'tskapi.t4gverse.com' },
      { protocol: 'https', hostname: 'tsk-alpha.vercel.app' },
    ],
    unoptimized: true, // Optional: if you want to skip Next.js optimization for simple serving
  },
};

export default nextConfig;
