import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  return { title: product?.title ?? "Product", description: product?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    notFound();
  }

  // Map Prisma Product to Frontend Product format temporarily
  const formattedProduct = {
    ...product,
    slug: product.id,
    name: product.title,
    images: [product.imagePath],
    sizes: product.sizes.split(", "),
    colors: product.colors.split(", "),
    fabric: "Premium",
    stock: product.inStock ? 10 : 0,
    rating: 5,
    reviews: 1,
    brand: "Sawera"
  };

  return <ProductDetailClient initialProduct={formattedProduct} slug={product.id} />;
}
