import { ProductSkeleton } from "@/components/commerce/skeleton";

export default function Loading() {
  return <section className="container-lux grid grid-cols-2 gap-4 py-14 md:grid-cols-4"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></section>;
}
