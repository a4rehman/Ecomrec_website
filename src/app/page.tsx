import { HomeContent } from "@/components/commerce/home-content";
import { listProducts } from "@/lib/product-service";

// Serve the already-rendered catalog immediately, then refresh it in the
// background. Product writes also invalidate the tagged catalog cache.
export const revalidate = 60;

export default async function Home() {
  const products = await listProducts();
  return <HomeContent initialProducts={products} />;
}
