import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      { source: "/laleia", destination: "/laleia/index.html" },
      { source: "/gloss", destination: "/gloss/index.html" },
      { source: "/atelier-void", destination: "/atelier-void/index.html" },
      { source: "/nia", destination: "/nia/index.html" },
    ];
  },
};

export default nextConfig;
