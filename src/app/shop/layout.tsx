import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Sawera Collection's full range of premium women's fashion — lawn, formal, festive & casual wear. Shop online in Pakistan with fast delivery.",
  keywords: ["women fashion", "lawn suits", "formal wear", "pakistani dresses", "online shopping"],
  alternates: { canonical: "https://www.saweracollection.com/shop" },
  openGraph: {
    title: "Shop | Sawera Collection",
    description: "Browse premium women's fashion — lawn, formal, festive & casual wear.",
    url: "https://www.saweracollection.com/shop"
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
