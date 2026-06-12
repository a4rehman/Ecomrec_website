import Image from "next/image";
import { products } from "@/data/products";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function AboutPage() {
  return (
    <section className="container-lux py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <BrandLogo className="mb-8 items-start" imageClassName="w-52" showTagline />
          <p className="tracked-luxury text-xs text-accent">Our Story</p>
          <h1 className="mt-4 font-serif text-6xl md:text-7xl">Made for Her, Inspired by Grace.</h1>
          <p className="mt-6 leading-8 text-muted">
            Sawera Collection is a luxury feminine fashion house shaped by soft elegance, premium modest style, and graceful confidence. Based in Lahore, Pakistan, we blend delicate embellishment, refined fabrics, and modern silhouettes for women and girls who want fashion that feels polished, feminine, and timeless.
          </p>
        </div>
        <div className="lux-sheen relative min-h-[520px] overflow-hidden rounded-[32px]">
          <Image src={products[1].images[0]} alt="Sawera Collection Atelier" fill sizes="50vw" className="object-cover" />
        </div>
      </div>
      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          "Grace: Feminine silhouettes designed to feel refined without trying too hard.",
          "Quality: Premium lawn, chiffon, silk blends, and details selected for a high-end finish.",
          "Confidence: Elegant modest fashion for everyday beauty, celebrations, and meaningful occasions."
        ].map((t) => (
          <div className="glass p-7 text-sm leading-7" key={t}>
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}
