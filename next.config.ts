import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    // Product photos are hosted on Shopify CDN. Load them directly because
    // Vercel's optimizer rejects these signed/parameterized image URLs.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/og-image.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" }]
      },
      {
        source: "/sawera-logo.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" }]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/blogBlog",
        destination: "/blog",
        permanent: true
      },
      {
        source: "/blog/blog",
        destination: "/blog",
        permanent: true
      },
      {
        source: "/collections/:path*",
        destination: "/shop",
        permanent: true
      },
      {
        source: "/products/:path*",
        destination: "/shop",
        permanent: true
      },
      {
        source: "/product-category/:path*",
        destination: "/shop",
        permanent: true
      },
      {
        source: "/categories/:path*",
        destination: "/shop",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
