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
      { source: "/matcha", destination: "/matcha/index.html" },
      { source: "/masterclass", destination: "/masterclass/index.html" },
      { source: "/zakaznici", destination: "/masterclass/index.html" },
      { source: "/webinar", destination: "/masterclass/index.html" },
      { source: "/nia", destination: "/nia/index.html" },
      { source: "/nia/projekty", destination: "/nia/projekty/index.html" },
      { source: "/nia/bezpecnost", destination: "/nia/bezpecnost/index.html" },
      { source: "/nia/dekujeme-poptavka", destination: "/nia/dekujeme-poptavka/index.html" },
      { source: "/nia/dekujeme-konzultace", destination: "/nia/dekujeme-konzultace/index.html" },
      { source: "/nia/admin/logy", destination: "/nia/admin/logy.html" },
      { source: "/klic-estate", destination: "/klic-estate/index.html" },
      { source: "/realitka", destination: "/klic-estate/index.html" },
      { source: "/lume", destination: "/lume/index.html" },
      { source: "/klinika", destination: "/lume/index.html" },
      { source: "/bdy", destination: "/bdy-to-bdy/index.html" },
      { source: "/vini-d-elite", destination: "/vini-d-elite/index.html" },
      { source: "/vini-d-elite/la-cantina", destination: "/vini-d-elite/la-cantina.html" },
      { source: "/vinidelite", destination: "/vini-d-elite/index.html" },
    ];
  },
};

export default nextConfig;
