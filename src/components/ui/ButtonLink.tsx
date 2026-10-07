import type { ReactNode } from "react";

export default function ButtonLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`label inline-flex items-center rounded-full px-6 py-3 transition ${
        primary ? "bg-accent text-obsidian hover:bg-amber-400" : "border border-white/20 text-zinc-100 hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </a>
  );
}
