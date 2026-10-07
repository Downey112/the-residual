"use client";
import { useEffect, useState } from "react";
import { SITE } from "@/content/site";

const NAV = [
  ["Apparel", "#tee"],
  ["Book", "#book"],
  ["Index", "#index"],
  ["Philosophy", "#philosophy"],
] as const;

export default function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors ${solid ? "border-b border-white/10 bg-obsidian/80 backdrop-blur-md" : ""}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-lg tracking-[0.18em]">
          {SITE.name.toUpperCase()}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-8">
          {NAV.map(([l, h]) => (
            <a key={h} href={h} className="label hidden text-zinc-400 transition hover:text-accent sm:inline">
              {l}
            </a>
          ))}
          <a href="#index" className="label rounded-full border border-accent/60 px-4 py-2 text-accent transition hover:bg-accent hover:text-obsidian sm:hidden">
            Index
          </a>
        </nav>
      </div>
    </header>
  );
}
