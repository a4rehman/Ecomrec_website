"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

interface HeroSliderProps {
  products: Product[];
}

const SLIDE_DURATION = 7000; // 7 seconds

export function HeroSlider({ products }: HeroSliderProps) {
  const slides = products.slice(0, 5); // max 5 slides
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
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

  // Auto-advance every 7 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const slide = slides[current];
  if (!slide) return null;

  // Slide animation variants — premium right-to-left slide with scale
  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      scale: 1.15,
      opacity: 0,
    }),
    center: {
      x: 0,
      scale: 1.05,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      scale: 0.95,
      opacity: 0,
    }),
  };

  // Text overlay animation variants — staggered reveal
  const textContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.4,
      },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const textChildVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: -30,
      filter: "blur(6px)",
      transition: { duration: 0.35 },
    },
  };

  return (
    <section
      className="relative min-h-[calc(100svh-180px)] overflow-hidden bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated background images */}
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
            scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.6, ease: "easeInOut" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={slide.images[0]}
            alt={slide.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_18%]"
          />
          {/* Ken Burns slow zoom effect via CSS */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 7, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2a1818]/76 via-[#6f4144]/34 to-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Animated grain texture for premium feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Text content */}
      <div className="container-lux relative flex min-h-[calc(100svh-180px)] items-center pb-12 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-text"}
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-w-3xl text-white"
          >
            <motion.p
              variants={textChildVariants}
              className="tracked-luxury text-xs text-white/70"
            >
              {slide.category} — {slide.brand}
            </motion.p>
            <motion.h1
              variants={textChildVariants}
              className="mt-3 font-serif text-6xl leading-none md:text-8xl"
            >
              {slide.name}
            </motion.h1>
            <motion.p
              variants={textChildVariants}
              className="brand-script mt-4 text-lg text-white/86"
            >
              Made for Her. Inspired by Grace
            </motion.p>
            <motion.p
              variants={textChildVariants}
              className="mt-4 max-w-xl text-base leading-8 text-white/80"
            >
              {slide.description.length > 120
                ? slide.description.slice(0, 120) + "…"
                : slide.description}
            </motion.p>
            <motion.div
              variants={textChildVariants}
              className="mt-6 flex items-center gap-5"
            >
              <span className="font-serif text-3xl tracking-wide">
                Rs {slide.price.toLocaleString()}
              </span>
              {slide.compareAt && (
                <span className="text-base text-white/50 line-through">
                  Rs {slide.compareAt.toLocaleString()}
                </span>
              )}
            </motion.div>
            <motion.div
              variants={textChildVariants}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href={`/product/${slide.slug}`}>
                <Button>
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="border-white bg-white/10 text-white hover:bg-white hover:text-foreground"
                >
                  View Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom slide indicators with progress bar */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="group relative h-1.5 cursor-pointer overflow-hidden rounded-full transition-all duration-500"
            style={{ width: i === current ? 48 : 16 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className="absolute inset-0 rounded-full bg-white/30" />
            {i === current && (
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: SLIDE_DURATION / 1000,
                  ease: "linear",
                }}
                key={`progress-${current}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide counter — subtle top-right badge */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
        <span className="font-serif text-base font-bold text-white">
          {String(current + 1).padStart(2, "0")}
        </span>
        <span className="text-white/40">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
