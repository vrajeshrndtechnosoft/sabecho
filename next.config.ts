import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
images: {
    remotePatterns: [
    ],
    dangerouslyAllowSVG: true, 
  },
};

export default nextConfig;

//  new URL(`/api/v1/image/**`)]
