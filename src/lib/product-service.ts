import { Prisma, Product as DbProduct } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { Product } from "@/data/products";
import { prisma } from "@/lib/db";

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Older rows may contain a comma-separated value.
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function publicImages(value: unknown): string[] {
  const images = stringList(value);
  // Never send legacy database-embedded image binaries to a visitor. A
  // migration removes them permanently; this guard keeps responses safe while
  // a deployment is rolling out. Keep valid remote images in mixed legacy
  // rows instead of replacing the whole gallery with a placeholder.
  const safeImages = images.filter((image) => !image.startsWith("data:image/"));
  return safeImages.length ? safeImages : ["/images/hero_lawn.png"];
}

export function toProduct(product: DbProduct): Product {
  return {
    id: product.id, slug: product.slug, name: product.name, category: product.category,
    brand: product.brand, price: Number(product.price),
    compareAt: product.compareAt == null ? undefined : Number(product.compareAt),
    rating: Number(product.rating), reviews: product.reviews, badge: product.badge ?? undefined,
    colors: stringList(product.colors), sizes: stringList(product.sizes), images: publicImages(product.images),
    description: product.description, fabric: product.fabric, stock: product.stock,
    salePrice: product.salePrice == null ? undefined : Number(product.salePrice), saleEnd: product.saleEnd ?? undefined,
    status: product.status === "draft" ? "draft" : "published",
    isActive: product.isActive,
    publishedAt: product.publishedAt?.toISOString(),
    sku: product.sku ?? undefined,
    tags: stringList(product.tags),
  };
}

export function productWriteData(input: Omit<Product, "id">): Prisma.ProductUncheckedCreateInput {
  return {
    slug: input.slug, name: input.name.trim(), category: input.category, brand: input.brand,
    price: input.price, compareAt: input.compareAt ?? null, rating: input.rating, reviews: input.reviews,
    badge: input.badge ?? null, colors: JSON.stringify(input.colors), sizes: JSON.stringify(input.sizes),
    images: JSON.stringify(input.images), description: input.description.trim(), fabric: input.fabric,
    stock: input.stock, salePrice: input.salePrice ?? null, saleEnd: input.saleEnd ?? null,
    status: input.status || "published", isActive: input.isActive ?? true,
    publishedAt: input.status === "draft" ? null : input.publishedAt ? new Date(input.publishedAt) : new Date(),
    sku: input.sku?.trim() || null, tags: input.tags?.length ? JSON.stringify(input.tags) : null,
  };
}

async function queryProducts(includeUnpublished = false): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: includeUnpublished ? undefined : { status: "published", isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProduct);
}

// The public catalog is read far more often than it changes. Keeping it in
// Next's shared data cache avoids a slow Hostinger MySQL connection on every
// visitor's first product request. Product writes invalidate this cache.
const cachedPublishedProducts = unstable_cache(
  () => queryProducts(false),
  ["published-products-v2"],
  { revalidate: 300, tags: ["products"] },
);

export async function listProducts(includeUnpublished = false): Promise<Product[]> {
  return includeUnpublished ? queryProducts(true) : cachedPublishedProducts();
}

export async function findProduct(identifier: string, includeInactive = false): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      ...(includeInactive ? {} : { status: "published", isActive: true }),
    },
  });
  return product ? toProduct(product) : null;
}

export function safeDatabaseMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) return "Database connection is unavailable. Please contact the site administrator.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "A product with this URL slug already exists.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") return "Product database table is not ready. The administrator must deploy the database migration.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && ["P1000", "P1001", "P1002"].includes(error.code)) return "Database connection is unavailable. Please contact the site administrator.";
  return "The product could not be saved. Please try again.";
}
