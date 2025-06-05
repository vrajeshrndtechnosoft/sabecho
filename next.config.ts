import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://sabecho.com/api/v1/explore-categories/image/**'), new URL('https://sabecho.com/api/v1/image/**')],
    dangerouslyAllowSVG: true,  
  },
};

export default nextConfig;
