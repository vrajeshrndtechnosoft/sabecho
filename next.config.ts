import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://sabecho.com/api/v1/explore-categories/image/**')],
  },
};

export default nextConfig;
