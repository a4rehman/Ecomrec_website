import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { revalidatePath, revalidateTag } from "next/cache";
import { HERO_BANNER_SLIDES, type BannerSlide } from "@/components/ui/HeroSlider";
import { listProducts } from "@/lib/product-service";

export interface HomeSliderItem {
  id: string;
  productId: string;
  selectedImage: string | null;
  sliderOrder: number;
  tagline: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  ratingText: string | null;
  objectPosition: string | null;
  isActive: boolean;
  product?: {
    id: string;
    slug: string;
    name: string;
    category: string;
    brand: string;
    price: number;
    images: string[];
    fabric?: string;
    description?: string;
    status?: string;
    isActive?: boolean;
  };
}

function parseImages(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val !== "string") return [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // legacy comma-separated
  }
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

async function queryHomepageSlides(): Promise<BannerSlide[]> {
  try {
    if (!process.env.DATABASE_URL) {
      return HERO_BANNER_SLIDES;
    }

    // 1. Fetch active configured slider items ordered by sliderOrder
    let sliderEntries: any[] = [];
    try {
      sliderEntries = await prisma.homeSlider.findMany({
        where: { isActive: true },
        orderBy: { sliderOrder: "asc" },
      });
    } catch (err) {
      console.warn("home_sliders table query failed (falling back):", err instanceof Error ? err.message : String(err));
    }

    if (sliderEntries && sliderEntries.length > 0) {
      const productIds = sliderEntries.map((s) => s.productId);
      const dbProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          status: "published",
          isActive: true,
        },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));
      const slides: BannerSlide[] = [];

      for (const entry of sliderEntries) {
        const product = productMap.get(entry.productId);
        if (!product) continue;

        const productImages = parseImages(product.images);
        if (productImages.length === 0) continue;

        // Choose selected image or fallback to first product image
        let chosenImage = entry.selectedImage?.trim();
        if (!chosenImage || !productImages.includes(chosenImage)) {
          chosenImage = productImages[0];
        }

        // Avoid broken or data URI images in hero LCP
        if (!chosenImage || chosenImage.startsWith("data:")) {
          chosenImage = productImages.find((img) => !img.startsWith("data:")) || productImages[0];
        }
        if (!chosenImage) continue;

        slides.push({
          id: `slide-product-${product.id}`,
          tagline: entry.tagline?.trim() || product.category?.toUpperCase() || "PREMIUM EMBROIDERY",
          title: entry.title?.trim() || product.name,
          description: entry.description?.trim() || (product.fabric ? `${product.fabric} with signature embroidery and graceful drape.` : product.description.slice(0, 140)),
          ctaText: entry.ctaText?.trim() || "SHOP NOW",
          href: `/product/${product.slug}`,
          image: chosenImage,
          ratingText: entry.ratingText?.trim() || "Handcrafted Luxury & Premium Fabrics",
          objectPosition: entry.objectPosition?.trim() || "center 22%",
        });
      }

      if (slides.length > 0) {
        return slides;
      }
    }

    // Fallback: If no slider configured, use top published products with images
    const publishedProducts = await listProducts(false);
    if (publishedProducts.length > 0) {
      const productSlides: BannerSlide[] = [];
      for (const product of publishedProducts.slice(0, 5)) {
        const validImage = product.images.find((img) => img && !img.startsWith("data:"));
        if (!validImage) continue;

        productSlides.push({
          id: `slide-auto-${product.id}`,
          tagline: product.category?.toUpperCase() || "NEW ARRIVAL",
          title: product.name,
          description: product.fabric ? `${product.fabric} with delicate detailing.` : product.description.slice(0, 120),
          ctaText: "SHOP NOW",
          href: `/product/${product.slug}`,
          image: validImage,
          ratingText: "Handcrafted Luxury & Premium Fabrics",
          objectPosition: "center 22%",
        });
      }

      if (productSlides.length > 0) {
        return productSlides;
      }
    }

    return HERO_BANNER_SLIDES;
  } catch (err) {
    console.error("Error generating homepage slides:", err);
    return HERO_BANNER_SLIDES;
  }
}

export const getCachedHomepageSlides = unstable_cache(
  queryHomepageSlides,
  ["homepage-hero-slides-v1"],
  { revalidate: 60, tags: ["home_sliders", "products"] }
);

export async function listAdminSliders(): Promise<HomeSliderItem[]> {
  try {
    const entries = await prisma.homeSlider.findMany({
      orderBy: { sliderOrder: "asc" },
    });

    const productIds = entries.map((e) => e.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return entries.map((entry) => {
      const prod = productMap.get(entry.productId);
      return {
        id: entry.id,
        productId: entry.productId,
        selectedImage: entry.selectedImage,
        sliderOrder: entry.sliderOrder,
        tagline: entry.tagline,
        title: entry.title,
        description: entry.description,
        ctaText: entry.ctaText,
        ratingText: entry.ratingText,
        objectPosition: entry.objectPosition,
        isActive: entry.isActive,
        product: prod
          ? {
              id: prod.id,
              slug: prod.slug,
              name: prod.name,
              category: prod.category,
              brand: prod.brand,
              price: Number(prod.price),
              images: parseImages(prod.images),
              fabric: prod.fabric,
              description: prod.description,
              status: prod.status,
              isActive: prod.isActive,
            }
          : undefined,
      };
    });
  } catch (err) {
    console.error("listAdminSliders error:", err);
    return [];
  }
}

export async function revalidateHomeSliderCache() {
  revalidateTag("home_sliders");
  revalidateTag("products");
  revalidatePath("/");
}
