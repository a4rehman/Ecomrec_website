"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    image: "/images/sawera-hero-blush-premium.png",
    eyebrow: "The Summer Atelier",
    title: "A study in soft elegance.",
    text: "Delicate embroidery, fluid silhouettes, and everyday pieces made to be remembered.",
    href: "/shop?category=Luxury%20Lawn",
    action: "Shop Luxury Lawn"
  },
  {
    image: "/images/sawera-hero-emerald-premium.png",
    eyebrow: "Festive Formals",
    title: "Crafted for your moments.",
    text: "Discover luminous details and timeless occasion wear with a modern Sawera sensibility.",
    href: "/shop?category=Festive%20Chiffon",
    action: "Explore the edit"
  }
];

export function PremiumHeroSlider() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];
  return (
    <section className="relative min-h-[calc(100svh-180px)] overflow-hidden bg-foreground" aria-roledescription="carousel" aria-label="Sawera Collection campaign">
      <AnimatePresence mode="wait">
        <motion.div key={slide.image} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.85, ease: "easeOut" }} className="absolute inset-0">
          <Image src={slide.image} alt="Sawera Collection luxury fashion campaign" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#1c1211]/82 via-[#382321]/44 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
      <div className="container-lux relative flex min-h-[calc(100svh-180px)] items-center py-20">
        <AnimatePresence mode="wait">
          <motion.div key={slide.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, delay: 0.15 }} className="max-w-2xl text-white">
            <p className="tracked-luxury text-[10px] text-white/76">{slide.eyebrow}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[.95] sm:text-6xl md:text-8xl">{slide.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/86 md:text-lg md:leading-8">{slide.text}</p>
            <div className="mt-9 flex flex-wrap gap-4"><Link href={slide.href}><Button>{slide.action} <ArrowRight size={16} /></Button></Link><Link href="/shop"><Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-foreground">View all pieces</Button></Link></div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="container-lux absolute inset-x-0 bottom-8 z-10 flex items-center justify-between">
        <div className="flex gap-2" aria-label="Slide selection">{slides.map((item, index) => <button key={item.image} aria-label={`Show slide ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`focus-ring h-1.5 transition-all ${index === active ? "w-9 bg-white" : "w-4 bg-white/45 hover:bg-white/75"}`} />)}</div>
        <div className="flex gap-2"><button onClick={() => setActive((active - 1 + slides.length) % slides.length)} className="focus-ring grid h-10 w-10 place-items-center border border-white/40 bg-black/10 text-white transition hover:bg-white hover:text-foreground" aria-label="Previous slide"><ArrowLeft size={18} /></button><button onClick={() => setActive((active + 1) % slides.length)} className="focus-ring grid h-10 w-10 place-items-center border border-white/40 bg-black/10 text-white transition hover:bg-white hover:text-foreground" aria-label="Next slide"><ArrowRight size={18} /></button></div>
      </div>
    </section>
  );
}