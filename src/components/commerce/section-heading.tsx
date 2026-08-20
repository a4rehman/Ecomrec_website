"use client";

import { motion } from "framer-motion";

export function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
    >
      <div>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.24em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="tracked-luxury mb-3 text-xs text-accent"
          >
            {eyebrow}
          </motion.p>
        )}
        <h2 className="font-serif text-4xl md:text-6xl">{title}</h2>
      </div>
      {text && <p className="max-w-md leading-7 text-muted">{text}</p>}
    </motion.div>
  );
}
