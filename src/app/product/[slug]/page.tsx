import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";
import { breadcrumbSchema, productSchema, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0];
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | Sawera Collection`,
      description: product.description,
      url: `${SITE_URL}/product/${product.slug}`,
      type: "website",
      images: [{ url: image, alt: product.name }]
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
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
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
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
