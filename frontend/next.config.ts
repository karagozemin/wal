import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable static export when WALRUS_DEPLOY env var is set
  ...(process.env.WALRUS_DEPLOY === 'true' && {
    output: 'export', // Static export for Walrus Sites
  }),
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;