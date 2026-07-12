"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductStrip } from "@/components/commerce/product-strip";
import { SectionHeading } from "@/components/commerce/section-heading";
import { blogPosts, categories, getProductsByBadge, getProductsByCategory, testimonials } from "@/data/products";
import { HeroSlider } from "@/components/ui/HeroSlider";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { FadeIn } from "@/components/ui/FadeIn";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const MARQUEE_TEXT =
  "SAWERA COLLECTION · MADE FOR HER. INSPIRED BY GRACE · NEW ARRIVALS · MODEST FASHION · BLUSH EDITS · PREMIUM PRET · FESTIVE FORMALS · ";

const trustBadges = [
  [Truck, "Worldwide Express Delivery"],
  [ShieldCheck, "Secure Payment Options"],
  [Sparkles, "Luxury Feminine Detail"],
] as const;

export default function Home() {
  const { products, priceTier } = useSelector((state: RootState) => state.commerce);

  const filteredProducts = products.filter((p) => {
    if (priceTier === "premium") return p.price >= 5000;
    if (priceTier === "simple") return p.price < 5000;
    return true;
  });

  const sliderProducts = filteredProducts.length >= 3 ? filteredProducts : products;

  const bestSellers = getProductsByBadge(products, "Best Seller");
  const celebrityEdit = getProductsByBadge(products, "Celebrity");
  const unstitchedDresses = getProductsByCategory(products, "Unstitched");
  const premiumNewArrivals = products.filter((p) =>
    ["sc_tehwaar_anayra_amal", "sc_amour_bin_ilyas_186a", "sc_amour_bin_ilyas_187b", "sc_push_pawan_zarizaa_titli"].includes(p.id)
  );

  return (
    <>
      <HeroSlider products={sliderProducts} />
      <div className="overflow-hidden border-y border-line bg-foreground py-4 text-background">
        <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="tracked-luxury shrink-0 pr-8 text-xs">
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      <FadeIn className="container-lux py-16">
        <SectionHeading eyebrow="Most Loved" title="Best Sellers" />
        <ProductStrip products={bestSellers} />
      </FadeIn>

      <FadeIn className="py-8">
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3.2/1]">
          <Image
            src="/home_page_images/banner_luxury_lawn.png"
            alt="Sawera Luxury Lawn Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-y-0 left-8 md:left-16 flex flex-col justify-center text-white z-10 max-w-md md:max-w-xl">
            <p className="tracked-luxury text-xs text-white/80 uppercase">The Heritage Collection</p>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl lg:text-6xl text-white">Luxury Lawn '26</h2>
            <p className="mt-4 text-xs md:text-sm text-white/90 leading-relaxed font-light hidden sm:block">
              Intricately detailed resham embroidery, premium fabrics, and signature silhouettes crafted for summer grace.
            </p>
            <div className="mt-6">
              <Link href="/shop?category=Luxury%20Lawn">
                <Button className="bg-white text-black hover:bg-black hover:text-white transition-all text-xs font-semibold px-6 py-2 h-auto rounded-none">
                  Shop Luxury Lawn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading
          eyebrow="Star Style"
          title="Celebrity Edit"
          text="Embroidered raw silk, luxury lawn, and chiffon pieces inspired by iconic festive looks."
        />
        <ProductStrip products={celebrityEdit} showFabric />
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading eyebrow="Just In" title="Premium New Arrivals" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-8">
          {premiumNewArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </FadeIn>

      <FadeIn className="py-8">
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3.2/1]">
          <Image
            src="/home_page_images/banner_festive_collection.png"
            alt="Sawera Festive Collection Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-y-0 right-8 md:right-16 flex flex-col justify-center text-right text-white z-10 max-w-md md:max-w-xl ml-auto">
            <p className="tracked-luxury text-xs text-white/80 uppercase">Bespoke Couture</p>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl lg:text-6xl text-white">Festive Formals</h2>
            <p className="mt-4 text-xs md:text-sm text-white/90 leading-relaxed font-light hidden sm:block">
              Opulent chiffon, raw silk, and organza ensembles embellished with handcrafted tilla, gota, and dabka work.
            </p>
            <div className="mt-6 flex justify-end">
              <Link href="/shop?category=Festive%20Chiffon">
                <Button className="bg-white text-black hover:bg-black hover:text-white transition-all text-xs font-semibold px-6 py-2 h-auto rounded-none">
                  Explore Couture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-20">
        <SectionHeading
          eyebrow="Featured"
          title="The Grace Edit"
          text="Explore soft silhouettes, premium fabrics, and delicate detailing designed for modern women and girls who love refined fashion."
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-8">
          {filteredProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </FadeIn>

      <section className="container-lux grid gap-4 py-10 md:grid-cols-4">
        {categories.slice(0, 4).map((cat, i) => (
          <FadeIn key={cat} delay={i * 0.08}>
            <Link href="/shop" className="lux-sheen group relative block min-h-80 overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
              <Image
                src={(filteredProducts[i % filteredProducts.length] || products[0]).images[0]}
                alt={cat}
                fill
                sizes="25vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3b2022]/72 via-[#6f4144]/18 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <p className="tracked-luxury text-[10px] text-white/70">Sawera Edit</p>
                <h3 className="mt-2 font-serif text-3xl text-white transition duration-500 group-hover:translate-x-1">{cat}</h3>
              </div>
            </Link>
          </FadeIn>
        ))}
      </section>

      <FadeIn className="container-lux py-20">
        <div className="botanical-panel premium-surface grid gap-8 overflow-hidden p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <div className="relative z-10">
            <p className="tracked-luxury text-xs text-accent">Private Boutique Offer</p>
            <h2 className="mt-3 font-serif text-5xl">Graceful Festive Savings</h2>
            <p className="mt-5 text-muted">
              Get 15% off selected everyday and unstitched luxury pieces. Use coupon <b>SAWERA15</b> at checkout.
            </p>
          </div>
          <CountdownTimer />
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading
          eyebrow="Shop by Fabric"
          title="Unstitched Dresses"
          text="Express shipping on selected unstitched lawn and festive sets — perfect for tailors and custom fits."
        />
        <ProductStrip products={unstitchedDresses} />
      </FadeIn>

      <FadeIn className="py-8">
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3.2/1]">
          <Image
            src="/home_page_images/banner_summer_edit.png"
            alt="Sawera Summer Edit Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-y-0 left-8 md:left-16 flex flex-col justify-center text-white z-10 max-w-md md:max-w-xl">
            <p className="tracked-luxury text-xs text-white/80 uppercase">Atelier Summer Edit</p>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl lg:text-6xl text-white">The Garden Edit</h2>
            <p className="mt-4 text-xs md:text-sm text-white/90 leading-relaxed font-light hidden sm:block">
              Lightweight cambric cotton and fine printed lawn ensembles detailed with soft pastel colors and floral prints.
            </p>
            <div className="mt-6">
              <Link href="/shop?category=Printed%20Lawn">
                <Button className="bg-white text-black hover:bg-black hover:text-white transition-all text-xs font-semibold px-6 py-2 h-auto rounded-none">
                  View Printed Lawn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading eyebrow="New Arrivals" title="Made to Be Remembered" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-8">
          {(filteredProducts.length >= 3 ? filteredProducts.slice(1, 4) : filteredProducts).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </FadeIn>

      <section className="border-y border-line py-16">
        <div className="container-lux grid gap-8 md:grid-cols-3">
          {trustBadges.map(([Icon, text], i) => (
            <FadeIn key={text} delay={i * 0.1}>
              <div className="premium-surface flex items-center gap-4 p-6 transition hover:-translate-y-1">
                <Icon className="text-accent" />
                <span className="tracked-luxury text-sm">{text}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <FadeIn className="container-lux py-20">
        <SectionHeading eyebrow="Clients" title="Atelier Reviews" />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="glass p-7 leading-8 transition hover:-translate-y-1"
            >
              &ldquo;{t}&rdquo;
            </motion.blockquote>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <div className="botanical-panel premium-surface grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div className="relative z-10">
            <p className="brand-script text-xl text-accent">Made for Her. Inspired by Grace</p>
            <h2 className="mt-3 font-serif text-5xl">A softer kind of confidence.</h2>
            <p className="mt-4 max-w-2xl leading-8 text-muted">
              Sawera Collection brings premium modest fashion, polished occasion wear, and elegant everyday pieces into one graceful wardrobe.
            </p>
          </div>
          <Link href="/about" className="relative z-10">
            <Button variant="outline">
              Discover Sawera <Eye size={15} />
            </Button>
          </Link>
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading eyebrow="Journal" title="Editorial Notes" />
        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((b, i) => (
            <FadeIn key={b.slug} delay={i * 0.08}>
              <Link href={`/blog/${b.slug}`} className="group block">
                <div className="lux-sheen relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={b.image} alt={b.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="tracked-luxury mt-5 text-xs text-accent">{b.category}</p>
                <h3 className="mt-2 font-serif text-3xl transition group-hover:text-accent">{b.title}</h3>
                <p className="mt-2 text-muted">{b.excerpt}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="container-lux py-16">
        <SectionHeading eyebrow="Gallery" title="Follow the Atelier" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {(filteredProducts.length >= 6 ? filteredProducts.slice(0, 6) : products.slice(0, 6)).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="relative aspect-square overflow-hidden"
            >
              <Image src={p.images[0]} alt={p.name} fill sizes="16vw" className="object-cover transition duration-700 hover:scale-110" />
            </motion.div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="container-lux pb-16">
        <SectionHeading eyebrow="FAQ" title="Before You Order" />
        <div className="space-y-2">
          {[
            {
              q: "Do you offer tailoring and stitching services?",
              a: "Yes, we offer premium professional stitching for both local and international orders. You can choose from standard sizes (XS to XL) or select custom tailoring during checkout by submitting your measurements. Stitching typically adds 7-10 business days to fulfillment.",
            },
            {
              q: "How fast is shipping, both domestically and internationally?",
              a: "Domestic delivery within Pakistan takes 2-4 business days. International express shipping via DHL/FedEx takes 5-7 business days to the USA, UK, Canada, and UAE. Custom-stitched suits require additional processing time.",
            },
            {
              q: "What is included in the Unstitched fabric options?",
              a: "Our 3-piece Unstitched suits include full running fabric for the shirt/kameez (typically 3 meters), matching dyed trousers fabric (2.5 meters), and a fully woven or printed dupatta (2.5 meters). Any separate embroidered borders, necklines, or lace trims are packaged separately for your tailor to attach.",
            },
            {
              q: "How should I care for suits with heavy tilla and zari work?",
              a: "We strongly recommend dry cleaning for all products containing delicate hand-embroidery, gota borders, tilla work, or premium silk/chiffon fabrics. Iron on low heat on the reverse side of the embroidery to avoid damage.",
            },
          ].map((item, i) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group border-b border-line py-5"
            >
              <summary className="cursor-pointer list-none font-medium transition group-open:text-accent [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </FadeIn>
    </>
  );
}
