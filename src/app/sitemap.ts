import type { MetadataRoute } from "next";
import { blogPosts, products } from "@/data/products";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/blog", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.3 },
    { path: "/terms-of-service", priority: 0.3 },
    { path: "/refund-policy", priority: 0.3 },
    { path: "/return-exchange", priority: 0.3 },
    { path: "/order-cancellation", priority: 0.3 }
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p.priority
    })),
    ...productEntries,
    ...blogEntries
  ];
}
