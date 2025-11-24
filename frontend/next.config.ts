import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export', // Static export for Walrus Sites
  }),
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;