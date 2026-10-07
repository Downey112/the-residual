"use client";
import { useState } from "react";
import { BOOK, CHAPTERS, EPILOGUE, MAX_SPREAD, spreadForChapter } from "@/content/book";
import { LINKS } from "@/content/site";
import BookViewer from "../three/BookViewer";
import Reveal from "../ui/Reveal";
import ButtonLink from "../ui/ButtonLink";
import { usePreview } from "../PreviewProvider";

export default function BookSection() {
  const [spread, setSpread] = useState(0);
  const { open } = usePreview();
  const sections = [...CHAPTERS, EPILOGUE];
  const activeId = sections.find((c) => spreadForChapter(c.id) === spread)?.id;
  return (
    <section id="book" className="border-y border-white/10 bg-panel/40">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
          <Reveal className="order-2 lg:order-1">
            <p className="label text-accent">02 · Book</p>
            <h2 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">{BOOK.title}</h2>
            <p className="mt-2 font-display italic text-zinc-400">{BOOK.subtitle}</p>
            <p className="mt-6 leading-relaxed text-zinc-300">{BOOK.blurb}</p>
            <p className="label mt-6 text-zinc-500">{BOOK.format} · 6 chapters · {BOOK.readingTime}</p>
            <ol className="mt-8 grid gap-1.5" aria-label="Chapters">
              {sections.map((c) => {
                const on = c.id === activeId;
                return (
                  <li key={c.id} className="flex items-center gap-2">
                    <button type="button" onClick={() => setSpread(spreadForChapter(c.id))} aria-current={on}
                      className={`group flex flex-1 items-baseline gap-4 rounded-lg border px-4 py-2.5 text-left transition ${on ? "border-accent/60 bg-accent/10" : "border-transparent hover:border-white/15"}`}>
                      <span className="label w-20 shrink-0 text-zinc-500">{c.label}</span>
                      <span className={`font-display tracking-wide ${on ? "text-accent" : "text-zinc-200"}`}>{c.title}</span>
                    </button>
                    <button type="button" onClick={() => open(c.id)} aria-label={`Preview ${c.title}`}
                      className="label rounded-full px-3 py-2 text-zinc-500 transition hover:text-accent">Read</button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-8"><ButtonLink primary href={LINKS.book}>Get the book</ButtonLink></div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl border border-white/10 bg-obsidian grid-bg">
              <BookViewer spread={spread} onSpread={setSpread} />
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
                <button type="button" onClick={() => setSpread((s) => Math.max(0, s - 1))} disabled={spread === 0} aria-label="Previous spread"
                  className="label rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30">‹</button>
                <span className="label text-zinc-400">{spread === 0 ? "Click the book to open" : `Spread ${spread} / ${MAX_SPREAD}`}</span>
                <button type="button" onClick={() => setSpread((s) => Math.min(MAX_SPREAD, s + 1))} disabled={spread === MAX_SPREAD} aria-label="Next spread"
                  className="label rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30">›</button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
