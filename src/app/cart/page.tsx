import { Metadata } from "next";
import { CartClient } from "@/components/commerce/cart-client";

export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Your Sawera Collection shopping bag — review items, sizes and proceed to secure checkout.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/cart" }
};

export default function CartPage() {
  return (
    <section className="container-lux py-10 sm:py-14">
      <h1 className="mb-6 sm:mb-10 font-serif text-4xl sm:text-6xl">Shopping Bag</h1>
      <CartClient />
    </section>
  );
}
