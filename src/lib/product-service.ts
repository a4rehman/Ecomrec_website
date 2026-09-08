import { Prisma, Product as DbProduct } from "@prisma/client";
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

export function toProduct(product: DbProduct): Product {
  return {
    id: product.id, slug: product.slug, name: product.name, category: product.category,
    brand: product.brand, price: Number(product.price),
    compareAt: product.compareAt == null ? undefined : Number(product.compareAt),
    rating: Number(product.rating), reviews: product.reviews, badge: product.badge ?? undefined,
    colors: stringList(product.colors), sizes: stringList(product.sizes), images: stringList(product.images),
    description: product.description, fabric: product.fabric, stock: product.stock,
    salePrice: product.salePrice == null ? undefined : Number(product.salePrice), saleEnd: product.saleEnd ?? undefined,
    status: product.status === "draft" ? "draft" : "published",
    isActive: product.isActive,
    publishedAt: product.publishedAt?.toISOString(),
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
  };
}

export async function listProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { status: "published", isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProduct);
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
  return "The product could not be saved. Please try again.";
}
