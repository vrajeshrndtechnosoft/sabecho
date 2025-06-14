import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/explore-category/image/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;

//  new URL(`/api/v1/image/**`)]
