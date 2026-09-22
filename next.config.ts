import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  async headers() {
    return [
      {
        source: "/home_page_images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/sawera-logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/og-image.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" }]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true
      },
      {
        source: "/Home",
        destination: "/",
        permanent: true
      },
      {
        source: "/$",
        destination: "/",
        permanent: true
      },
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
