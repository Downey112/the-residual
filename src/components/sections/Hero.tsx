"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SITE } from "@/content/site";
import ScatterField from "./ScatterField";

export default function Hero() {
  const reduced = useReducedMotion();
  const up = (d: number) => ({
    initial: reduced ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/0 via-obsidian/30 to-obsidian" />
      <ScatterField />
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-24 sm:px-8">
        <motion.p {...up(0.1)} className="label text-accent">Portfolio · Apparel and Book</motion.p>
        <motion.h1 {...up(0.2)} className="mt-6 font-display text-5xl leading-[1.02] tracking-[0.06em] sm:text-7xl lg:text-8xl">
          THE<br />RESIDUAL
        </motion.h1>
        <motion.p {...up(0.35)} className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-300">
          {SITE.description}
        </motion.p>
        <motion.div {...up(0.5)} className="mt-10 flex flex-wrap gap-3">
          <a href="#tee" className="label rounded-full bg-accent px-6 py-3 text-obsidian transition hover:bg-amber-400">Rotate the tee</a>
          <a href="#book" className="label rounded-full border border-white/20 px-6 py-3 transition hover:border-accent hover:text-accent">Open the book</a>
        </motion.div>
        <motion.p {...up(0.7)} className="mt-16 font-display text-xl italic text-zinc-400">{SITE.tagline}</motion.p>
      </div>
    </section>
  );
}
