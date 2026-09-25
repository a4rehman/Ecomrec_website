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

export function isValidImageUrl(image: unknown): boolean {
  if (typeof image !== "string") return false;
  const trimmed = image.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("file:") ||
    trimmed.includes("fakepath") ||
    trimmed.includes("undefined") ||
    trimmed.includes("null") ||
    trimmed.startsWith("C:\\") ||
    trimmed.startsWith("D:\\")
  ) {
    return false;
  }
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
}

function publicImages(value: unknown): string[] {
  const images = stringList(value);
  // Never send legacy database-embedded image binaries, temporary blob URLs,
  // or invalid local paths to a visitor. Keep valid remote/stored images in mixed legacy
  // rows instead of replacing the whole gallery with a placeholder.
  const safeImages = images.map((img) => img.trim()).filter(isValidImageUrl);
  return safeImages.length ? safeImages : ["/images/hero_lawn.png"];
}

function normalizeProductName(name: string): string {
  let trimmed = name.trim()
    .replace(/\s+by\s+(Anayra|Bin Ilyas|Zarizaa|Mushq|Maherposh|Tehzeeb|Tehzeeb Libas)\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const upper = trimmed.toUpperCase();
  if (
    upper === "JAZERA EMBROIDERED 3PC" ||
    upper === "JAZIRA EMBROIDERED 3PC" ||
    upper === "JAZERA EMBROIDERED 3 PC" ||
    upper === "JAZIRA EMBROIDERED 3 PC" ||
    upper === "JAZERA EMBROIDERED" ||
    upper === "JAZIRA EMBROIDERED"
  ) {
    return "JAZERA";
  }
  if (upper === "NAGMA") {
    return "DILARA";
  }
  if (upper === "FALAK") {
    return "ELAAN";
  }
  return trimmed;
}

export function toProduct(product: DbProduct): Product {
  return {
    id: product.id, slug: product.slug, name: normalizeProductName(product.name), category: product.category,
    brand: "Sawera Collection", price: Number(product.price),
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
  const sanitizedImages = (Array.isArray(input.images) ? input.images : [input.images])
    .filter(isValidImageUrl)
    .map((img) => img.trim());
  const finalImages = sanitizedImages.length > 0 ? sanitizedImages : ["/images/hero_lawn.png"];

  return {
    slug: input.slug, name: input.name.trim(), category: input.category, brand: input.brand,
    price: input.price, compareAt: input.compareAt ?? null, rating: input.rating, reviews: input.reviews,
    badge: input.badge ?? null, colors: JSON.stringify(input.colors), sizes: JSON.stringify(input.sizes),
    // A focused five-image gallery keeps product pages fast and easy to browse.
    images: JSON.stringify(finalImages.slice(0, 5)), description: input.description.trim(), fabric: input.fabric,
    stock: input.stock, salePrice: input.salePrice ?? null, saleEnd: input.saleEnd ?? null,
    status: input.status || "published", isActive: input.isActive ?? true,
    publishedAt: input.status === "draft" ? null : input.publishedAt ? new Date(input.publishedAt) : new Date(),
    sku: input.sku?.trim() || null, tags: input.tags?.length ? JSON.stringify(input.tags) : null,
  };
}

async function queryProducts(includeUnpublished = false): Promise<Product[]> {
  try {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    const products = await prisma.product.findMany({
      where: includeUnpublished ? undefined : { status: "published", isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return products.map(toProduct);
  } catch (error) {
    console.warn("Prisma query failed:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

// The public catalog is cached with tag 'products' which is invalidated immediately on any admin product mutation
const cachedPublishedProducts = unstable_cache(
  () => queryProducts(false),
  ["published-products-v3"],
  { revalidate: 60, tags: ["products"] },
);

export async function listProducts(includeUnpublished = false): Promise<Product[]> {
  return includeUnpublished ? queryProducts(true) : cachedPublishedProducts();
}

export async function findProduct(identifier: string, includeInactive = false): Promise<Product | null> {
  try {
    if (!process.env.DATABASE_URL) {
      return null;
    }
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        ...(includeInactive ? {} : { status: "published", isActive: true }),
      },
    });
    if (!product) {
      return null;
    }
    return toProduct(product);
  } catch (error) {
    console.warn("Prisma findProduct failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

export function safeDatabaseMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) return "Database connection is unavailable. Please contact the site administrator.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "A product with this URL slug already exists.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") return "Product database table is not ready. The administrator must deploy the database migration.";
  if (error instanceof Prisma.PrismaClientKnownRequestError && ["P1000", "P1001", "P1002"].includes(error.code)) return "Database connection is unavailable. Please contact the site administrator.";
  return "The product could not be saved. Please try again.";
}
