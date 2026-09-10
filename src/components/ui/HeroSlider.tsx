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

export const DEFAULT_HERO_POSITION: HeroPositionConfig = {
  desktop: "center 22%",
  tablet: "center 24%",
  mobile: "center 28%",
};

type HeroSlideConfig = Partial<HeroPositionConfig> & { imageIndex?: number };

/**
 * Per-slide framing. Portrait catalog photos cannot fill a wide viewport with
 * object-cover without cropping the suit — the layout keeps the photo in a
 * portrait column, and these values only nudge the remaining crop.
 */
export const HERO_SLIDE_CONFIG: Record<string, HeroSlideConfig> = {
  "jazera-embroidered-3pc": { imageIndex: 0, desktop: "center 16%", tablet: "center 18%", mobile: "center 20%" },
  "nagma": { imageIndex: 0, desktop: "center 28%", tablet: "center 30%", mobile: "center 32%" },
  "falak": { imageIndex: 0, desktop: "center 22%", tablet: "center 24%", mobile: "center 26%" },
  "bluebell-bloom-3pc": { imageIndex: 0, desktop: "center 18%", tablet: "center 20%", mobile: "center 22%" },
  "zaviya": { imageIndex: 0, desktop: "center 20%", tablet: "center 22%", mobile: "center 24%" },
  "zoya-blush-floral-lawn": { imageIndex: 0, desktop: "center 18%", tablet: "center 20%", mobile: "center 22%" },
  "celeste-royal-black-peshwas": { imageIndex: 0, desktop: "center 20%", tablet: "center 22%", mobile: "center 24%" },
  "sawera-embroidered-lawn-set": { imageIndex: 0, desktop: "center 18%", tablet: "center 20%", mobile: "center 22%" },
  "gul-e-noor-festive-peshwas": { imageIndex: 0, desktop: "center 18%", tablet: "center 20%", mobile: "center 22%" },
  "chikankari-cotton-kurti": { imageIndex: 0, desktop: "center 16%", tablet: "center 18%", mobile: "center 20%" },
};

export const PRODUCT_NAME_DISPLAY_OVERRIDES: Record<string, string> = {
  "JAZERA EMBROIDERED 3PC": "JAZERA",
  "JAZIRA EMBROIDERED 3PC": "JAZERA",
  "JAZERA EMBROIDERED 3 PC": "JAZERA",
  "JAZIRA EMBROIDERED 3 PC": "JAZERA",
  "JAZERA EMBROIDERED": "JAZERA",
  "JAZIRA EMBROIDERED": "JAZERA",
  "dilara-purple-heart": "JAZERA",
  "NAGMA": "DILARA",
  "FALAK": "ELAAN",
  "jazera-embroidered-3pc": "JAZERA",
  "jazira-embroidered-3pc": "JAZERA",
  "nagma": "DILARA",
  "falak": "ELAAN",
};

export function getSlideDisplayName(slide: Product): string {
  const trimmed = slide.name.trim();
  const byName = PRODUCT_NAME_DISPLAY_OVERRIDES[trimmed.toUpperCase()] || PRODUCT_NAME_DISPLAY_OVERRIDES[trimmed];
  if (byName) return byName;
  const bySlug = PRODUCT_NAME_DISPLAY_OVERRIDES[slide.slug.toLowerCase()];
  if (bySlug) return bySlug;
  return trimmed;
}

export function getSlidePosition(slide: Product): HeroPositionConfig {
  const fromProduct =
    slide.heroObjectPositionDesktop || slide.heroObjectPositionMobile
      ? {
          desktop: slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.desktop,
          tablet: slide.heroObjectPositionTablet || slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.tablet,
          mobile: slide.heroObjectPositionMobile || slide.heroObjectPositionDesktop || DEFAULT_HERO_POSITION.mobile,
        }
      : undefined;
  const custom = fromProduct || HERO_SLIDE_CONFIG[slide.slug] || HERO_SLIDE_CONFIG[slide.id];
  return {
    desktop: custom?.desktop || DEFAULT_HERO_POSITION.desktop,
    tablet: custom?.tablet || DEFAULT_HERO_POSITION.tablet,
    mobile: custom?.mobile || DEFAULT_HERO_POSITION.mobile,
  };
}

export function getHeroImage(slide: Product): string {
  const index = HERO_SLIDE_CONFIG[slide.slug]?.imageIndex ?? HERO_SLIDE_CONFIG[slide.id]?.imageIndex ?? 0;
  const src = slide.images[index] || slide.images[0];
  return sharpenCatalogImage(src);
}

function sharpenCatalogImage(src: string | undefined): string {
  if (!src) return "/images/hero_lawn.png";
  try {
    if (!src.includes("cdn.shopify.com")) return src;
    const url = new URL(src);
    if (!url.searchParams.has("width")) url.searchParams.set("width", "1800");
    return url.toString();
  } catch {
    return src;
  }
}

const imageVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const textContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const textChildVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.28, ease: "easeIn" },
  },
};

export function HeroSlider({ products }: HeroSliderProps) {
  const slides = products.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const slide = slides[current];
  if (!slide) return null;

  const pos = getSlidePosition(slide);
  const slideClassId = `hero-img-${slide.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const heroSrc = getHeroImage(slide);

  return (
    <section
      className="relative overflow-hidden bg-[#1a1210]"
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

      <div className="grid min-h-[calc(100svh-8.5rem)] lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
        <div className="relative z-10 order-2 flex items-end lg:order-1 lg:items-center">
          <div className="container-lux w-full pb-20 pt-8 lg:py-20">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${slide.id}-text`}
                variants={textContainerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="max-w-xl text-white"
              >
                <motion.p variants={textChildVariants} className="tracked-luxury text-xs text-white/75">
                  {slide.category} — {slide.brand}
                </motion.p>
                <motion.h1 variants={textChildVariants} className="mt-3 font-serif text-4xl leading-none sm:text-6xl md:text-7xl lg:text-8xl">
                  {getSlideDisplayName(slide)}
                </motion.h1>
                <motion.p variants={textChildVariants} className="brand-script mt-4 text-lg text-white/90">
                  Made for Her. Inspired by Grace
                </motion.p>
                <motion.p variants={textChildVariants} className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                  {slide.description.length > 120 ? `${slide.description.slice(0, 120)}…` : slide.description}
                </motion.p>
                <motion.div variants={textChildVariants} className="mt-6 flex items-center gap-5">
                  <span className="font-serif text-3xl tracking-wide">Rs {slide.price.toLocaleString()}</span>
                  {slide.compareAt && (
                    <span className="text-base text-white/70 line-through">Rs {slide.compareAt.toLocaleString()}</span>
                  )}
                </motion.div>
                <motion.div variants={textChildVariants} className="mt-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="inline-block">
                    <Link href={`/product/${slide.slug}`}>
                      <Button>
                        Shop Now <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative order-1 min-h-[70vh] lg:order-2 lg:min-h-full">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={slide.id}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroSrc}
                alt={`${getSlideDisplayName(slide)} - ${slide.category} by Sawera Collection`}
                fill
                priority={current === 0}
                fetchPriority={current === 0 ? "high" : "auto"}
                loading={current === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1023px) 100vw, 42vw"
                quality={95}
                className={`object-cover ${slideClassId}`}
              />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1210]/80 from-0% via-transparent via-24% to-transparent lg:bg-gradient-to-r lg:from-[#1a1210] lg:via-[#1a1210]/15 lg:via-18% lg:to-transparent" />
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <motion.button
            onClick={prev}
            whileHover={{ scale: 1.06, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            className="focus-ring absolute left-3 top-[32%] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md md:left-6 lg:top-1/2 lg:-translate-y-1/2"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <motion.button
            onClick={next}
            whileHover={{ scale: 1.06, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            className="focus-ring absolute right-3 top-[32%] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md md:right-6 lg:top-1/2 lg:-translate-y-1/2"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </motion.button>
        </>
      )}

      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6">
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
                  className="absolute inset-0 origin-left rounded-full bg-white"
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
