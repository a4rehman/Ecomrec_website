import { HomeContent } from "@/components/commerce/home-content";
import { listProducts } from "@/lib/product-service";

export default async function Home() {
  const products = await listProducts();
  return <HomeContent initialProducts={products} />;
}
