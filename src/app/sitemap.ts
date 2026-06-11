import type { MetadataRoute } from "next";
import { blogPosts, products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://maisonelara.example";
  return [
    "", "/shop", "/cart", "/checkout", "/wishlist", "/dashboard", "/login", "/register", "/about", "/contact", "/blog", "/admin",
    ...products.map((p) => `/product/${p.slug}`),
    ...blogPosts.map((p) => `/blog/${p.slug}`)
  ].map((url) => ({ url: `${base}${url}`, lastModified: new Date() }));
}
