import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["face-api.js", "@neondatabase/serverless"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default nextConfig;
