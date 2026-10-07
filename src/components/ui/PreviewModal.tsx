"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { ASSETS, assetById, type Asset } from "@/content/assets";
import { ALL_SECTIONS } from "@/content/book";
import { Fig1, Fig2, Fig3 } from "../figures/Figures";

function Body({ asset }: { asset: Asset }) {
  if (asset.kind === "image" && asset.src) {
    const dark = asset.id === "tee-art";
    return (
      <div className={`relative aspect-square w-full max-h-[62vh] ${dark ? "bg-black" : ""}`}>
        <Image src={asset.src} alt={asset.title} fill sizes="(min-width:1024px) 640px, 92vw" className="object-contain p-4" priority />
      </div>
    );
  }
  if (asset.kind === "chapter") {
    const ch = ALL_SECTIONS.find((c) => c.id === asset.chapterId);
    if (!ch) return null;
    return (
      <div className="px-6 py-8 sm:px-12">
        <p className="label text-accent">{ch.label}</p>
        <h3 className="mt-3 font-display text-3xl tracking-wide sm:text-4xl">{ch.title}</h3>
        <p className="mt-6 max-w-prose font-sans text-lg leading-relaxed text-zinc-200">
          <span className="float-left mr-3 font-display text-6xl leading-[0.85] text-accent">{ch.excerpt.trim()[0]}</span>
          {ch.excerpt.trim().slice(1)}
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-500">Opening of the chapter</p>
      </div>
    );
  }
  return (
    <div className="px-6 py-8 sm:px-12">
      {asset.figure === "fig1" && <Fig1 />}
      {asset.figure === "fig2" && <Fig2 />}
      {asset.figure === "fig3" && <Fig3 />}
    </div>
  );
}

export default function PreviewModal({ current, onChange }: { current: string | null; onChange: (id: string | null) => void }) {
  const asset = current ? assetById(current) : undefined;
  const panel = useRef<HTMLDivElement>(null);
  const idx = asset ? ASSETS.findIndex((a) => a.id === asset.id) : -1;

  const step = useCallback(
    (d: number) => {
      if (idx < 0) return;
      onChange(ASSETS[(idx + d + ASSETS.length) % ASSETS.length].id);
    },
    [idx, onChange],
  );

  useEffect(() => {
    if (!asset) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
        if (!f.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [asset, onChange, step]);

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button aria-label="Close preview" className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm" onClick={() => onChange(null)} />
          <motion.div
            ref={panel}
            layoutId={`asset-${asset.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={asset.title}
            tabIndex={-1}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="scroll-thin relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-panel shadow-2xl outline-none"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-panel/90 px-5 py-3 backdrop-blur">
              <div className="min-w-0">
                <p className="label text-accent">{asset.tag}</p>
                <h2 className="truncate font-display text-lg tracking-wide">{asset.title}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconBtn label="Previous asset" onClick={() => step(-1)}>‹</IconBtn>
                <span className="label hidden px-2 text-zinc-500 sm:inline">
                  {idx + 1} / {ASSETS.length}
                </span>
                <IconBtn label="Next asset" onClick={() => step(1)}>›</IconBtn>
                <IconBtn label="Close" onClick={() => onChange(null)}>✕</IconBtn>
              </div>
            </div>
            <motion.div key={asset.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12, duration: 0.3 }}>
              <Body asset={asset} />
              <p className="border-t border-white/10 px-6 py-5 text-sm leading-relaxed text-zinc-400 sm:px-12">{asset.caption}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full text-lg text-zinc-300 transition hover:bg-white/10 hover:text-accent"
    >
      {children}
    </button>
  );
}
