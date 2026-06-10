import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("petra-sladek")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-50">Life & career coaching</p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">{brand.name}</h1>
        <p className="mt-4 text-lg opacity-70">{brand.tagline}</p>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed opacity-60">
          Osobní koučink 1:1 — bez motivačních plakátů, s reálnými kroky a prostorem pro vaše tempo.
        </p>
        <Link
          href="/petra-sladek/rezervace"
          className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brand.accent }}
        >
          Domluvit úvodní hovor zdarma
        </Link>
      </div>
    </section>
  );
}
