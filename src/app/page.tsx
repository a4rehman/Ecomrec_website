"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/commerce/product-card";
import { SectionHeading } from "@/components/commerce/section-heading";
import { blogPosts, categories, testimonials } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { products, priceTier } = useSelector((state: RootState) => state.commerce);

  const filteredProducts = products.filter((p) => {
    if (priceTier === "premium") return p.price >= 5000;
    if (priceTier === "simple") return p.price < 5000;
    return true;
  });

  const hero = filteredProducts[0] || products[0];

  return (
    <>
      <section className="relative min-h-[calc(100svh-180px)] overflow-hidden bg-foreground">
        {hero && <Image src={hero.images[0]} alt="Sawera Collection luxury women's fashion" fill priority sizes="100vw" className="animate-[floatSlow_9s_ease-in-out_infinite] scale-105 object-cover object-[50%_18%]" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1818]/76 via-[#6f4144]/34 to-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="container-lux relative flex min-h-[calc(100svh-180px)] items-center pb-12 pt-20">
          <motion.div variants={reveal} initial="hidden" animate="show" transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-3xl text-white">
            <h1 className="font-serif text-6xl leading-none md:text-8xl">Sawera Collection</h1>
            <p className="brand-script mt-4 text-lg text-white/86">Made for Her. Inspired by Grace</p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/86">Luxury women&apos;s fashion crafted with elegance, confidence, and a soft feminine grace.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop"><Button>Shop Now <ArrowRight size={16} /></Button></Link>
              <Link href="/shop?sort=new"><Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-foreground">New Arrivals</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>
      <div className="overflow-hidden border-y border-line bg-foreground py-4 text-background">
        <div className="animate-[marquee_24s_linear_infinite] whitespace-nowrap tracked-luxury text-xs">SAWERA COLLECTION - MADE FOR HER. INSPIRED BY GRACE - NEW ARRIVALS - MODEST FASHION - BLUSH EDITS - PREMIUM PRET - FESTIVE FORMALS - </div>
      </div>
      <motion.section variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }} transition={{ duration: 0.65 }} className="container-lux py-20">
        <SectionHeading eyebrow="Featured" title="The Grace Edit" text="Explore soft silhouettes, premium fabrics, and delicate detailing designed for modern women and girls who love refined fashion." />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-8">{filteredProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </motion.section>
      <section className="container-lux grid gap-4 py-10 md:grid-cols-4">
        {categories.slice(0, 4).map((cat, i) => (
          <Link href="/shop" key={cat} className="lux-sheen group relative min-h-80 overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
            <Image src={(filteredProducts[i % filteredProducts.length] || products[0]).images[0]} alt={cat} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3b2022]/72 via-[#6f4144]/18 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <p className="tracked-luxury text-[10px] text-white/70">Sawera Edit</p>
              <h3 className="mt-2 font-serif text-3xl text-white">{cat}</h3>
            </div>
          </Link>
        ))}
      </section>
      <section className="container-lux py-20">
        <div className="botanical-panel premium-surface grid gap-8 overflow-hidden p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <div className="relative z-10"><p className="tracked-luxury text-xs text-accent">Private Boutique Offer</p><h2 className="mt-3 font-serif text-5xl">Graceful Festive Savings</h2><p className="mt-5 text-muted">Get 15% off selected everyday and unstitched luxury pieces. Use coupon <b>SAWERA15</b> at checkout.</p></div>
          <div className="grid grid-cols-3 gap-3 text-center">{[["08", "Hours"], ["42", "Minutes"], ["19", "Seconds"]].map(([value, label]) => <div className="border border-line bg-background/45 p-6 transition hover:-translate-y-1 hover:border-accent" key={label}><b className="font-serif text-4xl">{value}</b><p className="tracked-luxury mt-2 text-[10px]">{label}</p></div>)}</div>
        </div>
      </section>
      <section className="container-lux py-16">
        <SectionHeading eyebrow="New Arrivals" title="Made to Be Remembered" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-8">
          {(filteredProducts.length >= 3 ? filteredProducts.slice(1, 4) : filteredProducts).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="border-y border-line py-16">
        <div className="container-lux grid gap-8 md:grid-cols-3">{[[Truck, "Worldwide Express Delivery"], [ShieldCheck, "Secure Payment Options"], [Sparkles, "Luxury Feminine Detail"]].map(([Icon, text]) => <div className="premium-surface flex items-center gap-4 p-6" key={String(text)}><Icon className="text-accent" /><span className="tracked-luxury text-sm">{String(text)}</span></div>)}</div>
      </section>
      <section className="container-lux py-20">
        <SectionHeading eyebrow="Clients" title="Atelier Reviews" />
        <div className="grid gap-4 md:grid-cols-3">{testimonials.map((t) => <blockquote className="glass p-7 leading-8 transition hover:-translate-y-1" key={t}>"{t}"</blockquote>)}</div>
      </section>
      <section className="container-lux py-16">
        <div className="botanical-panel premium-surface grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div className="relative z-10">
            <p className="brand-script text-xl text-accent">Made for Her. Inspired by Grace</p>
            <h2 className="mt-3 font-serif text-5xl">A softer kind of confidence.</h2>
            <p className="mt-4 max-w-2xl leading-8 text-muted">Sawera Collection brings premium modest fashion, polished occasion wear, and elegant everyday pieces into one graceful wardrobe.</p>
          </div>
          <Link href="/about" className="relative z-10"><Button variant="outline">Discover Sawera <Eye size={15} /></Button></Link>
        </div>
      </section>
      <section className="container-lux py-16">
        <SectionHeading eyebrow="Journal" title="Editorial Notes" />
        <div className="grid gap-6 md:grid-cols-3">{blogPosts.map((b) => <Link href={`/blog/${b.slug}`} className="group" key={b.slug}><div className="lux-sheen relative aspect-[4/3] overflow-hidden"><Image src={b.image} alt={b.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><p className="tracked-luxury mt-5 text-xs text-accent">{b.category}</p><h3 className="mt-2 font-serif text-3xl">{b.title}</h3><p className="mt-2 text-muted">{b.excerpt}</p></Link>)}</div>
      </section>
      <section className="container-lux py-16">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {(filteredProducts.length >= 6 ? filteredProducts.slice(0, 6) : products.slice(0, 6)).map((p) => (
            <div className="relative aspect-square overflow-hidden" key={p.id}>
              <Image src={p.images[0]} alt="Instagram gallery" fill sizes="16vw" className="object-cover transition duration-700 hover:scale-110" />
            </div>
          ))}
        </div>
      </section>
      <section className="container-lux pb-16">
        <SectionHeading eyebrow="FAQ" title="Before You Order" />
        <div className="space-y-2">
          <details className="border-b border-line py-5">
            <summary className="cursor-pointer font-medium">Do you offer tailoring and stitching services?</summary>
            <p className="mt-3 text-muted">Yes, we offer premium professional stitching for both local and international orders. You can choose from standard sizes (XS to XL) or select custom tailoring during checkout by submitting your measurements. Stitching typically adds 7-10 business days to fulfillment.</p>
          </details>
          <details className="border-b border-line py-5">
            <summary className="cursor-pointer font-medium">How fast is shipping, both domestically and internationally?</summary>
            <p className="mt-3 text-muted">Domestic delivery within Pakistan takes 2-4 business days. International express shipping via DHL/FedEx takes 5-7 business days to the USA, UK, Canada, and UAE. Custom-stitched suits require additional processing time.</p>
          </details>
          <details className="border-b border-line py-5">
            <summary className="cursor-pointer font-medium">What is included in the Unstitched fabric options?</summary>
            <p className="mt-3 text-muted">Our 3-piece Unstitched suits include full running fabric for the shirt/kameez (typically 3 meters), matching dyed trousers fabric (2.5 meters), and a fully woven or printed dupatta (2.5 meters). Any separate embroidered borders, necklines, or lace trims are packaged separately for your tailor to attach.</p>
          </details>
          <details className="border-b border-line py-5">
            <summary className="cursor-pointer font-medium">How should I care for suits with heavy tilla and zari work?</summary>
            <p className="mt-3 text-muted">We strongly recommend dry cleaning for all products containing delicate hand-embroidery, gota borders, tilla work, or premium silk/chiffon fabrics. Iron on low heat on the reverse side of the embroidery to avoid damage.</p>
          </details>
        </div>
      </section>
    </>
  );
}
