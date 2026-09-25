import { HomeContent } from "@/components/commerce/home-content";
import { listProducts } from "@/lib/product-service";
import { getCachedHomepageSlides } from "@/lib/slider-service";

// Serve the already-rendered catalog immediately, then refresh it in the
// background. Product writes and slider updates invalidate the tagged cache.
export const revalidate = 60;

export default async function Home() {
  const [products, heroSlides] = await Promise.all([
    listProducts(),
    getCachedHomepageSlides(),
  ]);

  return <HomeContent initialProducts={products} heroSlides={heroSlides} />;
}

