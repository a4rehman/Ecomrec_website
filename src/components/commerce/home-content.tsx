"use client";

import dynamic from "next/dynamic";
import { HeroSlider } from "@/components/ui/HeroSlider";
import { faqSchema } from "@/lib/seo";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import type { Product } from "@/data/products";

const HomeBelowFold = dynamic(() => import("@/components/commerce/home-below-fold"), {
  ssr: true,
  loading: () => <div className="h-32" aria-hidden="true" />,
});

const MARQUEE_TEXT =
  "SAWERA COLLECTION Â· MADE FOR HER. INSPIRED BY GRACE Â· NEW ARRIVALS Â· MODEST FASHION Â· BLUSH EDITS Â· PREMIUM PRET Â· FESTIVE FORMALS Â· ";

export function HomeContent({ initialProducts }: { initialProducts: Product[] }) {
  const { priceTier } = useSelector((state: RootState) => state.commerce);
  const filteredProducts = initialProducts.filter((product) => {
    if (priceTier === "premium") return product.price >= 5000;
    if (priceTier === "simple") return product.price < 5000;
    return true;
  });
  const sliderProducts = filteredProducts.length >= 3 ? filteredProducts : initialProducts;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema([
        { q: "Do you offer tailoring and stitching services?", a: "Yes, we offer premium professional stitching for both local and international orders. You can choose from standard sizes (XS to XL) or select custom tailoring during checkout by submitting your measurements. Stitching typically adds 7-10 business days to fulfillment." },
        { q: "How fast is shipping, both domestically and internationally?", a: "Domestic delivery within Pakistan takes 2-4 business days. International express shipping via DHL/FedEx takes 5-7 business days to the USA, UK, Canada, and UAE. Custom-stitched suits require additional processing time." },
        { q: "What is included in the Unstitched fabric options?", a: "Our 3-piece Unstitched suits include full running fabric for the shirt/kameez (typically 3 meters), matching dyed trousers fabric (2.5 meters), and a fully woven or printed dupatta (2.5 meters). Any separate embroidered borders, necklines, or lace trims are packaged separately for your tailor to attach." },
        { q: "How should I care for suits with heavy tilla and zari work?", a: "We strongly recommend dry cleaning for all products containing delicate hand-embroidery, gota borders, tilla work, or premium silk/chiffon fabrics. Iron on low heat on the reverse side of the embroidery to avoid damage." },
      ])) }} />
      <HeroSlider products={sliderProducts} />
      <div className="overflow-hidden border-y border-line bg-foreground py-4"><div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap">{[0, 1].map((index) => <span key={index} className="tracked-luxury shrink-0 pr-8 text-xs">{MARQUEE_TEXT}</span>)}</div></div>
      <HomeBelowFold initialProducts={initialProducts} />
    </>
  );
}
