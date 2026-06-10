import type { Brand } from "@/lib/brands";

export function SiteHero({
  brand,
  cta,
}: {
  brand: Brand;
  cta?: { href: string; label: string };
}) {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: brand.accent }}
        >
          {brand.category} · {brand.city}
        </p>
        <h1 className="font-display mt-5 text-4xl leading-tight sm:text-5xl">{brand.tagline}</h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed opacity-65">
          {brand.description}
        </p>
        {cta && (
          <a
            href={cta.href}
            className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brand.accent }}
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
