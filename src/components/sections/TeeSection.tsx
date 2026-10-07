"use client";
import { useState } from "react";
import { LINKS, TEE } from "@/content/site";
import TeeViewer from "../three/TeeViewer";
import Reveal from "../ui/Reveal";
import ButtonLink from "../ui/ButtonLink";
import { usePreview } from "../PreviewProvider";

export default function TeeSection() {
  const [spin, setSpin] = useState(true);
  const [snap, setSnap] = useState<{ angle: number; nonce: number } | null>(null);
  const [face, setFace] = useState<"front" | "back" | null>(null);
  const { open } = usePreview();
  const go = (f: "front" | "back") => {
    setFace(f);
    setSpin(false);
    setSnap({ angle: f === "front" ? 0 : Math.PI, nonce: Date.now() });
  };
  return (
    <section id="tee" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <div className="relative aspect-[4/3.6] overflow-hidden rounded-3xl border border-white/10 bg-panel grid-bg">
            <TeeViewer spin={spin} snap={snap} onInteract={() => { setSpin(false); setFace(null); }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <span className="label rounded-full bg-black/50 px-4 py-1.5 text-zinc-400 backdrop-blur">Drag to rotate</span>
            </div>
            <div className="absolute left-4 top-4 flex gap-2">
              {(["front", "back"] as const).map((f) => (
                <button key={f} type="button" onClick={() => go(f)} aria-pressed={face === f}
                  className={`label rounded-full border px-4 py-2 backdrop-blur transition ${face === f ? "border-accent bg-accent text-obsidian" : "border-white/20 bg-black/40 text-zinc-200 hover:border-accent hover:text-accent"}`}>
                  {f}
                </button>
              ))}
              <button type="button" onClick={() => { setFace(null); setSpin((s) => !s); }} aria-pressed={spin}
                className="label rounded-full border border-white/20 bg-black/40 px-4 py-2 text-zinc-200 backdrop-blur transition hover:border-accent hover:text-accent">
                {spin ? "Pause" : "Spin"}
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="label text-accent">01 · Apparel</p>
          <p className="label mt-3 inline-block rounded-full border border-accent/50 px-3 py-1 text-accent">{TEE.status}</p>
          <h2 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">{TEE.name}</h2>
          <p className="mt-6 leading-relaxed text-zinc-300">{TEE.rationale}</p>
          <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
            {([["Blank", TEE.blank], ["Colourway", TEE.colourway], ["Ink", TEE.inks], ["Front", TEE.front], ["Back", TEE.back]] as const).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 py-3">
                <dt className="label text-zinc-500">{k}</dt>
                <dd className="text-zinc-200">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink primary href={LINKS.tee}>Get the tee</ButtonLink>
            {!LINKS.tee && <a href="#book" className="label rounded-full bg-accent px-6 py-3 text-obsidian transition hover:bg-amber-400">See the book</a>}
            <button type="button" onClick={() => open("tee-back")} className="label rounded-full border border-white/20 px-6 py-3 transition hover:border-accent hover:text-accent">Preview back</button>
            <button type="button" onClick={() => open("tee-front")} className="label rounded-full border border-white/20 px-6 py-3 transition hover:border-accent hover:text-accent">Preview front</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
