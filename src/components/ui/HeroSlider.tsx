"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

interface HeroSliderProps {
  products: Product[];
}

export interface HeroPositionConfig {
  desktop: string;
  tablet: string;
  mobile: string;
}

const SLIDE_DURATION = 7000;

// Default smart clothing-first positions (focusing on neckline, torso, embroidery, and full outfit)
export const DEFAULT_HERO_POSITION: HeroPositionConfig = {
  desktop: "60% 40%",
  tablet: "center 38%",
  mobile: "center 35%",
};

// Known custom focal overrides for specific product lines or curated editorial banners
export const HERO_CUSTOM_POSITIONS: Record<string, Partial<HeroPositionConfig>> = {
  "zoya-blush-floral-lawn": { desktop: "65% 42%", tablet: "center 40%", mobile: "center 36%" },
  "celeste-royal-black-peshwas": { desktop: "60% 38%", tablet: "center 38%", mobile: "center 35%" },
  "sawera-embroidered-lawn-set": { desktop: "65% 40%", tablet: "center 38%", mobile: "center 35%" },
  "gul-e-noor-festive-peshwas": { desktop: "62% 40%", tablet: "center 38%", mobile: "center 35%" },
  "chikankari-cotton-kurti": { desktop: "60% 38%", tablet: "center 36%", mobile: "center 35%" },
};

// Known display name overrides for hero products
export const PRODUCT_NAME_DISPLAY_OVERRIDES: Record<string, string> = {
  "JAZERA EMBROIDERED 3PC": "dilara-purple-heart",
  "JAZIRA EMBROIDERED 3PC": "dilara-purple-heart",
  "JAZERA EMBROIDERED 3 PC": "dilara-purple-heart",
  "JAZIRA EMBROIDERED 3 PC": "dilara-purple-heart",
  "JAZERA EMBROIDERED": "dilara-purple-heart",
  "JAZIRA EMBROIDERED": "dilara-purple-heart",
  "NAGMA": "DILARA",
  "FALAK": "ELAAN",
  "jazera-embroidered-3pc": "dilara-purple-heart",
  "jazira-embroidered-3pc": "dilara-purple-heart",
  "nagma": "DILARA",
  "falak": "ELAAN",
};

export function getSlideDisplayName(slide: Product): string {
  const byName = PRODUCT_NAME_DISPLAY_OVERRIDES[slide.name.trim().toUpperCase()] || PRODUCT_NAME_DISPLAY_OVERRIDES[slide.name.trim()];
  if (byName) return byName;
  const bySlug = PRODUCT_NAME_DISPLAY_OVERRIDES[slide.slug.toLowerCase()];
  if (bySlug) return bySlug;
  return slide.name;
}

export function getSlidePosition(slide: Product): HeroPositionConfig {
  const custom =
    slide.heroObjectPositionDesktop || slide.heroObjectPositionMobile
      ? {
          desktop: slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.desktop,
          tablet: slide.heroObjectPositionTablet || slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.tablet,
          mobile: slide.heroObjectPositionMobile || slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.mobile,
        }
      : HERO_CUSTOM_POSITIONS[slide.slug] || HERO_CUSTOM_POSITIONS[slide.id];

  return {
    desktop: custom?.desktop || DEFAULT_HERO_POSITION.desktop,
    tablet: custom?.tablet || DEFAULT_HERO_POSITION.tablet,
    mobile: custom?.mobile || DEFAULT_HERO_POSITION.mobile,
  };
}

// Single subtle transition: soft opacity fade with gentle lateral shift (NO compounded zoom)
const imageVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? "1%" : "-1%",
  }),
  center: {
    opacity: 1,
    x: "0%",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? "-1%" : "1%",
  }),
};

// Text staggering reveal coordinates
const textContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.35 },
  },
  exit: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
};

// Elegant text entry combining opacity and subtle translation
const textChildVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

export function HeroSlider({ products }: HeroSliderProps) {
  const slides = products.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [next, isPaused, slides.length]);

  const slide = slides[current];
  if (!slide) return null;

  const pos = getSlidePosition(slide);
  const slideClassId = `hero-img-${slide.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  return (
    <section
      className="relative min-h-[calc(100svh-180px)] overflow-hidden bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collection slider"
    >
      <style>{`
        .${slideClassId} {
          object-position: ${pos.mobile};
        }
        @media (min-width: 768px) {
          .${slideClassId} {
            object-position: ${pos.tablet};
          }
        }
        @media (min-width: 1024px) {
          .${slideClassId} {
            object-position: ${pos.desktop};
          }
        }
      `}</style>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.75, ease: "easeInOut" },
            x: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
          }}
          className="absolute inset-0"
        >
          {/* Single subtle Ken Burns scale animation (1.02 -> 1.0) without double scaling */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          >
            <Image
              src={slide.images[0]}
              alt={`${getSlideDisplayName(slide)} - ${slide.category} by Sawera Collection`}
              fill
              priority={current === 0}
              fetchPriority={current === 0 ? "high" : "auto"}
              loading={current === 0 ? "eager" : "lazy"}
              sizes="100vw"
              quality={90}
              className={`object-cover ${slideClassId}`}
            />
          </motion.div>

          {/* Directional luxury gradient overlay: ensures high text readability on left while keeping fabric & embroidery natural and bright */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:via-45% md:to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Smooth bottom transition to page background */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Luxury texture grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-lux relative flex min-h-[calc(100svh-180px)] items-center pb-16 pt-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${slide.id}-text`}
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-w-3xl text-white"
          >
            <motion.p variants={textChildVariants} className="tracked-luxury text-xs text-white/75">
              {slide.category} — {slide.brand}
            </motion.p>
            <motion.h1 variants={textChildVariants} className="mt-3 font-serif text-5xl leading-none sm:text-6xl md:text-8xl">
              {getSlideDisplayName(slide)}
            </motion.h1>
            <motion.p variants={textChildVariants} className="brand-script mt-4 text-lg text-white/90">
              Made for Her. Inspired by Grace
            </motion.p>
            <motion.p variants={textChildVariants} className="mt-4 max-w-xl text-base leading-8 text-white/80">
              {slide.description.length > 120 ? `${slide.description.slice(0, 120)}…` : slide.description}
            </motion.p>
            <motion.div variants={textChildVariants} className="mt-6 flex items-center gap-5">
              <span className="font-serif text-3xl tracking-wide">Rs {slide.price.toLocaleString()}</span>
              {slide.compareAt && (
                <span className="text-base text-white/70 line-through">Rs {slide.compareAt.toLocaleString()}</span>
              )}
            </motion.div>
            <motion.div variants={textChildVariants} className="mt-8 flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <Link href={`/product/${slide.slug}`}>
                  <Button>
                    Shop Now <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <Link href="/shop">
                  <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-foreground">
                    View Collection
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          {/* Navigation arrow buttons */}
          <motion.button
            onClick={prev}
            whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="focus-ring absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <motion.button
            onClick={next}
            whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="focus-ring absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </motion.button>
        </>
      )}

      {/* Luxury Slide Indicators with slide counter (01 / 05) */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6">
        <span className="font-serif text-xs tracking-widest text-white/80 select-none">
          0{current + 1} <span className="mx-1 text-white/40">/</span> 0{slides.length}
        </span>
        <div className="flex items-center gap-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="group relative h-1.5 cursor-pointer overflow-hidden rounded-full transition-all duration-500"
              style={{ width: i === current ? 48 : 16 }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            >
              <span className="absolute inset-0 rounded-full bg-white/30" />
              {i === current && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-white origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  key={`progress-${current}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

