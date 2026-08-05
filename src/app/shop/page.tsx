import type { Metadata } from "next";
import { products } from "@/data/products";
import { getCategoryMeta } from "@/data/seo-content";
import { breadcrumbSchema, collectionSchema, SITE_URL } from "@/lib/seo";
import { ShopContent } from "@/components/commerce/shop-content";

type ShopParams = Promise<{ category?: string }>;

const categoryPath = (category: string) =>
  category && category !== "All" ? `/shop?category=${encodeURIComponent(category)}` : "/shop";

export async function generateMetadata({ searchParams }: { searchParams: ShopParams }): Promise<Metadata> {
  const { category } = await searchParams;
  const meta = getCategoryMeta(category || "All");

  return {
    title: meta.title,
    description: meta.description,
    keywords: ["women fashion", "lawn suits", "pakistani dresses", "online shopping", ...(category ? [category.toLowerCase()] : [])],
    alternates: { canonical: `${SITE_URL}${categoryPath(category || "All")}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}${categoryPath(category || "All")}`,
      type: "website",
      siteName: "Sawera Collection",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sawera Collection" }]
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og-image.jpg"]
    }
  };
}

export default async function ShopPage({ searchParams }: { searchParams: ShopParams }) {
  const { category } = await searchParams;
  const activeCategory = category || "All";
  const meta = getCategoryMeta(activeCategory);

  const count = activeCategory === "All"
    ? products.length
    : activeCategory === "Trending"
      ? products.filter((p) => p.rating >= 4.8 || p.badge === "Bestseller").length
      : products.filter((p) => p.category === activeCategory).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      collectionSchema(meta.title, meta.description, categoryPath(activeCategory), count),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        ...(activeCategory !== "All" ? [{ name: activeCategory, path: categoryPath(activeCategory) }] : [])
      ])
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ShopContent />
    </>
  );
}
