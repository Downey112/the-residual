import { PHILOSOPHY } from "@/content/site";
import Reveal from "../ui/Reveal";

export default function Philosophy() {
  return (
    <section id="philosophy" className="border-t border-white/10">
      <div className="mx-auto max-w-4xl px-5 py-32 text-center sm:px-8">
        <Reveal>
          <p className="label text-accent">04 · Philosophy</p>
          <blockquote className="mt-8 font-display text-2xl leading-snug tracking-wide sm:text-4xl">“{PHILOSOPHY.quote}”</blockquote>
          <p className="mx-auto mt-8 max-w-xl text-lg text-zinc-300">{PHILOSOPHY.follow}</p>
          <p className="label mt-8 text-zinc-500">{PHILOSOPHY.source}</p>
        </Reveal>
      </div>
    </section>
  );
}
