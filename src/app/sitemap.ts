import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/products";
import { SITE_URL } from "@/lib/seo";
import { prisma } from "@/lib/db";

// Product URLs are read from MySQL at request time; do not require a database while building.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const categoryPages: { path: string; priority: number }[] = [
    { path: "/shop?category=Luxury%20Lawn", priority: 0.85 },
    { path: "/shop?category=Printed%20Lawn", priority: 0.85 },
    { path: "/shop?category=Festive%20Chiffon", priority: 0.85 },
    { path: "/shop?category=Everyday%20Essentials", priority: 0.8 },
    { path: "/shop?category=Bridal%20%26%20Couture", priority: 0.85 },
    { path: "/shop?category=Winter%20Festive", priority: 0.8 },
    { path: "/shop?category=Trending", priority: 0.85 },
    { path: "/shop?category=Sale", priority: 0.85 }
  ];

  // Read directly from MySQL so a product added, edited, published, or
  // removed in the admin panel is reflected in the next sitemap request.
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { status: "published", isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // Database unavailable
    products = [];
  }

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
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
    ...categoryPages.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: p.priority
    })),
    ...productEntries,
    ...blogEntries
  ];
}
