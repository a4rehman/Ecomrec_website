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

const imageVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    scale: 1.12,
    opacity: 0,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    scale: 0.96,
    opacity: 0,
  }),
};

const textContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.35 },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const textChildVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -30,
    filter: "blur(6px)",
    transition: { duration: 0.35 },
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
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 60, damping: 22, mass: 1.2 },
            scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
            opacity: { duration: 0.6, ease: "easeInOut" },
          }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          >
            <Image
              src={slide.images[0]}
              alt={slide.name}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_18%]"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#2a1818]/78 via-[#6f4144]/38 to-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />

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
              <Link href={`/product/${slide.slug}`}>
                <Button>
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-foreground">
                  View Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="focus-ring absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-foreground md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="focus-ring absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-foreground md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
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
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                key={`progress-${current}`}
              />
            )}
          </button>
        ))}
      </div>

    </section>
  );
}
