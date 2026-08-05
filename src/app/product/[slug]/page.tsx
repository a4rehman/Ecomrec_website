import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";
import { breadcrumbSchema, productFaqSchema, productSchema, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0];

  const description = `${product.name} by ${product.brand} — ${product.description} Available in ${product.colors.join(", ")}. ${product.fabric}. Free delivery across Pakistan in 2-4 business days.`;

  return {
    title: `${product.name} | ${product.category} | Sawera Collection`,
    description,
    keywords: [product.name, product.category, product.brand, product.fabric, "pakistani women's suits", "buy online pakistan"],
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | Sawera Collection`,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      type: "website",
      siteName: "Sawera Collection",
      images: [{ url: image, width: 1200, height: 1600, alt: product.name }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Sawera Collection`,
      description,
      images: [image]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      productSchema(product),
      productFaqSchema(product),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: product.category, path: `/shop?category=${encodeURIComponent(product.category)}` },
        { name: product.name, path: `/product/${product.slug}` }
      ])
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient initialProduct={product} slug={slug} />
    </>
  );
}
