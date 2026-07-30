import type { MetadataRoute } from "next";
import { blogPosts, products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.saweracollection.com";
  return [
    "", "/shop", "/about", "/contact", "/blog", "/wishlist",
    "/login", "/register", "/forgot-password",
    ...products.map((p) => `/product/${p.slug}`),
    ...blogPosts.map((p) => `/blog/${p.slug}`)
  ].map((url) => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: url === "" ? 1 : 0.8
  }));
}
