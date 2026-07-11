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

const SLIDE_DURATION = 7000;

// Premium cinematic transitions with soft lateral shifts and scale adjustments
const imageVariants: Variants = {
  enter: (dir: number) => ({
    scale: 1.15,
    opacity: 0,
    filter: "blur(15px)",
    x: dir > 0 ? "2%" : "-2%",
  }),
  center: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    x: "0%",
  },
  exit: (dir: number) => ({
    scale: 0.95,
    opacity: 0,
    filter: "blur(10px)",
    x: dir > 0 ? "-2%" : "2%",
  }),
};

// Slower text staggering reveal coordinates
const textContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.16, delayChildren: 0.45 },
  },
  exit: {
    transition: { staggerChildren: 0.08, staggerDirection: -1 },
  },
};

// Elegant text entry combining opacity, y-translation, scale, and soft blur
const textChildVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.97, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -25,
    scale: 0.98,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: "easeIn" },
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

  return (
    <section
      className="relative min-h-[calc(100svh-180px)] overflow-hidden bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collection slider"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            scale: { duration: 1.4, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.8, ease: "easeInOut" },
            filter: { duration: 0.8, ease: "easeInOut" },
            x: { duration: 1.2, ease: [0.25, 1, 0.5, 1] }
          }}
          className="absolute inset-0"
        >
          {/* Continuous luxury Ken Burns Zoom Out effect (Scale 1.12 -> 1.0) */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12, x: "-0.5%", y: "-0.5%" }}
            animate={{ scale: 1.0, x: "0%", y: "0%" }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          >
            <Image
              src={slide.images[0]}
              alt={slide.name}
              fill
              priority={current === 0}
              loading={current === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-[50%_18%]"
            />
          </motion.div>
          {/* Dark luxury gradient overlay animated with the main frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1818]/78 via-[#6f4144]/38 to-white/10" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Luxury layout grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-lux relative flex min-h-[calc(100svh-180px)] items-center pb-16 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-text`}
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-w-3xl text-white"
          >
            <motion.p variants={textChildVariants} className="tracked-luxury text-xs text-white/70">
              {slide.category} — {slide.brand}
            </motion.p>
            <motion.h1 variants={textChildVariants} className="mt-3 font-serif text-5xl leading-none sm:text-6xl md:text-8xl">
              {slide.name}
            </motion.h1>
            <motion.p variants={textChildVariants} className="brand-script mt-4 text-lg text-white/86">
              Made for Her. Inspired by Grace
            </motion.p>
            <motion.p variants={textChildVariants} className="mt-4 max-w-xl text-base leading-8 text-white/80">
              {slide.description.length > 120 ? `${slide.description.slice(0, 120)}…` : slide.description}
            </motion.p>
            <motion.div variants={textChildVariants} className="mt-6 flex items-center gap-5">
              <span className="font-serif text-3xl tracking-wide">Rs {slide.price.toLocaleString()}</span>
              {slide.compareAt && (
                <span className="text-base text-white/50 line-through">Rs {slide.compareAt.toLocaleString()}</span>
              )}
            </motion.div>
            <motion.div variants={textChildVariants} className="mt-8 flex flex-wrap gap-4">
              {/* Premium button motion scaling wrappers */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <Link href={`/product/${slide.slug}`}>
                  <Button>
                    Shop Now <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
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
          {/* Framer Motion navigation arrow buttons */}
          <motion.button
            onClick={prev}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="focus-ring absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-md transition-colors md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <motion.button
            onClick={next}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="focus-ring absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-md transition-colors md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </motion.button>
        </>
      )}

      {/* Luxury Slide Indicators with premium slide counter (01 / 05) */}
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
                // Performance optimized scaleX indicator instead of width change
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
