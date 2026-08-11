import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["face-api.js", "@neondatabase/serverless"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
