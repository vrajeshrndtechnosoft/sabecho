import type { NextConfig } from "next";
const API_URL = process.env.API_URL || "https://sabecho.com"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL(`${API_URL}/api/v1/explore-categories/image/**`), new URL(`${API_URL}/api/v1/image/**`)],
    dangerouslyAllowSVG: true,  
  },
};

export default nextConfig;
