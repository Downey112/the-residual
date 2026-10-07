import { LINKS, SITE } from "@/content/site";
import ButtonLink from "../ui/ButtonLink";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 sm:flex-row sm:px-8">
        <div>
          <p className="font-display tracking-[0.18em]">{SITE.name.toUpperCase()}</p>
          <p className="mt-1 font-display text-sm italic text-zinc-500">{SITE.tagline}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href={LINKS.contact}>Email</ButtonLink>
          <ButtonLink href={LINKS.whatsapp}>WhatsApp</ButtonLink>
        </div>
        <p className="label text-zinc-600">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
