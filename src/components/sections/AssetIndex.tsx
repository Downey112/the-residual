"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { ASSETS } from "@/content/assets";
import Reveal from "../ui/Reveal";
import { usePreview } from "../PreviewProvider";

const GROUPS = ["All", "Apparel", "Book", "Figures"] as const;

export default function AssetIndex() {
  const { open, current } = usePreview();
  const [g, setG] = useState<(typeof GROUPS)[number]>("All");
  const list = ASSETS.filter((a) => g === "All" || a.group === g);
  return (
    <section id="index" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <Reveal>
        <p className="label text-accent">03 · Index</p>
        <h2 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">Every asset, open to inspect</h2>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter assets">
          {GROUPS.map((x) => (
            <button key={x} role="tab" aria-selected={g === x} onClick={() => setG(x)}
              className={`label rounded-full border px-4 py-2 transition ${g === x ? "border-accent bg-accent text-obsidian" : "border-white/15 text-zinc-300 hover:border-accent hover:text-accent"}`}>{x}</button>
          ))}
        </div>
      </Reveal>
      <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((a) => (
          <motion.li layout key={a.id} transition={{ type: "spring", stiffness: 300, damping: 32 }}>
            <motion.button
              layoutId={`asset-${a.id}`}
              type="button"
              onClick={() => open(a.id)}
              style={{ opacity: current === a.id ? 0 : 1 }}
              whileHover={{ y: -4 }}
              className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel text-left transition-colors hover:border-accent/60"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-obsidian">
                {a.kind === "image" && a.src ? (
                  <Image src={a.src} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center px-4 text-center">
                    <span className="font-display text-xl tracking-wide text-zinc-300 transition-colors group-hover:text-accent">
                      {a.kind === "figure" ? a.tag : a.tag}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="label text-accent">{a.tag}</p>
                <p className="mt-1.5 font-display tracking-wide">{a.title}</p>
              </div>
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
