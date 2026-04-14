import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/**' },
      { protocol: 'https', hostname: 'tskapi.t4gverse.com', pathname: '/**' },
      { protocol: 'https', hostname: 'tsk-alpha.vercel.app', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
