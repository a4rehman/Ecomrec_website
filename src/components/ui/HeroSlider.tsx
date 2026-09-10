"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Product } from "@/data/products";

interface HeroSliderProps {
  products?: Product[];
}

export interface BannerSlide {
  id: string;
  tagline: string;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  image: string;
  ratingText: string;
  objectPosition?: string;
}

export const HERO_BANNER_SLIDES: BannerSlide[] = [
  {
    id: "slide-lavender-pret",
    tagline: "PREMIUM EMBROIDERY",
    title: "Elegance in Every Stitch",
    description: "Designed with intricate embroidery and luxurious fabrics, these ready-to-wear ensembles bring timeless sophistication to every occasion.",
    ctaText: "DISCOVER LUXURY PRET",
    href: "/shop?category=Luxury%20Lawn",
    image: "/home_page_images/hero_banner_1_lavender.jpg",
    ratingText: "4.9/5 from 30,500+ luxury shoppers",
    objectPosition: "center 22%",
  },
  {
    id: "slide-crimson-lawn",
    tagline: "STITCH DIFFERENT.",
    title: "Pure Cotton. Every Metre.",
    description: "Fresh prints, pure breathable cotton & handcrafted resham embroidery — your next favourite outfit is one stitch away.",
    ctaText: "DISCOVER UNSTITCHED",
    href: "/shop?category=Printed%20Lawn",
    image: "/home_page_images/hero_banner_2_crimson.jpg",
    ratingText: "4.9/5 | Customer-loved fabrics",
    objectPosition: "center 20%",
  },
  {
    id: "slide-teal-grace",
    tagline: "HANDCRAFTED, OCCASION-READY.",
    title: "Grace in Every Detail",
    description: "Intricate embroidery, rich pastel fabric — everything you need for effortless elegance and every occasion that matters.",
    ctaText: "FIND YOUR SIGNATURE PIECE",
    href: "/shop?category=Pret%20Wear",
    image: "/home_page_images/hero_banner_3_teal.jpg",
    ratingText: "4.9/5 from 20,000+ happy customers",
    objectPosition: "center 25%",
  },
  {
    id: "slide-royal-black",
    tagline: "OPULENT FESTIVE WEAR",
    title: "Own the Look. Own the Room.",
    description: "Flared silhouettes, heritage antique zardozi resham work, and midnight accents tailored for unforgettable celebrations.",
    ctaText: "DISCOVER FESTIVE FORMALS",
    href: "/shop?category=Festive%20Chiffon",
    image: "/home_page_images/hero_banner_4_royal_black.jpg",
    ratingText: "5.0/5 | Master artisan craftsmanship",
    objectPosition: "center 22%",
  },
  {
    id: "slide-blush-summer",
    tagline: "SUMMER LAWN '26",
    title: "Breezy Florals & Pure Silk",
    description: "Pastel blush tones, delicate blooming botanical motifs, and lightweight flowy silk dupattas crafted for sunny days.",
    ctaText: "EXPLORE SUMMER EDIT",
    href: "/shop?category=Printed%20Lawn",
    image: "/home_page_images/hero_banner_5_blush.jpg",
    ratingText: "4.8/5 from 18,000+ fashion lovers",
    objectPosition: "center 20%",
  },
];

const SLIDE_DURATION = 6500;

const textContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const textChildVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export function HeroSlider({ products }: HeroSliderProps) {
  const slides = HERO_BANNER_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [next, isPaused, slides.length]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 50) {
      next();
    } else if (diffX < -50) {
      prev();
    }
    touchStartX.current = null;
  };

  const slide = slides[current];
  if (!slide) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#120e0d] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured collection slider"
    >
      {/* Container height - optimized for immersive luxury hero view */}
      <div className="relative h-[82svh] min-h-[560px] max-h-[860px] w-full md:h-[86svh]">
        {/* Full-width Background Image Layer with smooth fade cross-transition */}
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt={`${slide.title} - Sawera Collection`}
              fill
              priority={current === 0}
              loading={current === 0 ? "eager" : "lazy"}
              sizes="100vw"
              quality={95}
              style={{ objectPosition: slide.objectPosition || "center 22%" }}
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Multi-stop Dark Gradient Vignette for perfect text legibility without blocking the model */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/20 md:bg-gradient-to-r md:from-black/85 md:via-black/45 md:via-40% md:to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/15" />

        {/* Content Overlay */}
        <div className="relative z-20 flex h-full items-end md:items-center pb-20 md:pb-0">
          <div className="container-lux w-full">
            <div className="max-w-2xl text-white">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${slide.id}-content`}
                  variants={textContainerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4 md:space-y-5"
                >
                  {/* Category Tagline */}
                  <motion.div variants={textChildVariants} className="flex items-center gap-2">
                    <span className="h-[2px] w-6 bg-accent" />
                    <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.28em] text-white/90 drop-shadow">
                      {slide.tagline}
                    </span>
                  </motion.div>

                  {/* Main Bold Headline */}
                  <motion.h1
                    variants={textChildVariants}
                    className="font-serif text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md text-white"
                  >
                    {slide.title}
                  </motion.h1>

                  {/* 2-line Description */}
                  <motion.p
                    variants={textChildVariants}
                    className="max-w-lg text-xs leading-relaxed text-white/90 sm:text-sm sm:leading-6 md:text-base md:leading-7 drop-shadow"
                  >
                    {slide.description}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div variants={textChildVariants} className="pt-2 sm:pt-3">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-block"
                    >
                      <Link
                        href={slide.href}
                        className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white hover:text-black sm:px-8 sm:py-4 sm:text-sm"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    </motion.div>
                  </motion.div>

                  {/* Star Rating Badge */}
                  <motion.div
                    variants={textChildVariants}
                    className="flex items-center gap-2 pt-1 text-[11px] text-white/80 drop-shadow sm:text-xs"
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" stroke="none" />
                      ))}
                    </div>
                    <span>{slide.ratingText}</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Left & Right Chevrons */}
        <motion.button
          onClick={prev}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 0.95)", color: "#000" }}
          whileTap={{ scale: 0.94 }}
          className="focus-ring absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 p-3 text-white backdrop-blur-md transition-all duration-300 sm:flex md:left-6"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </motion.button>

        <motion.button
          onClick={next}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 0.95)", color: "#000" }}
          whileTap={{ scale: 0.94 }}
          className="focus-ring absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 p-3 text-white backdrop-blur-md transition-all duration-300 sm:flex md:right-6"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </motion.button>

        {/* Horizontal Segment Progress Bars at Bottom Center (Matching Zellbury reference) */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:gap-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="group relative h-1 cursor-pointer overflow-hidden rounded-full transition-all duration-300 hover:h-1.5"
              style={{ width: i === current ? 44 : 26 }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            >
              {/* Inactive Track */}
              <span className="absolute inset-0 rounded-full bg-white/35 transition-colors group-hover:bg-white/50" />
              {/* Active Animated Progress Bar */}
              {i === current && (
                <motion.span
                  className="absolute inset-0 origin-left rounded-full bg-white shadow-sm"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  key={`progress-${current}-${isPaused ? 'paused' : 'running'}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
