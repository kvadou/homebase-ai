import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@homebase-ai/database", "@homebase-ai/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
