import Link from "next/link";
import { brandsByBuildOrder } from "@/lib/brands";
import { FeaturePills } from "@/components/FeaturePills";

const statusLabel = {
  live: "Hotovo",
  wip: "Rozpracováno",
  planned: "Plánováno",
  "awaiting-design": "Čeká na zadání",
} as const;

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#0E0E0F] text-[#F4F1EC]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(184,149,106,0.15),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#B8956A]">Portfolio demo</p>
          <h1 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl md:text-6xl">
            Fiktivní značky.
            <br />
            <span className="text-[#B8956A]">Skutečná práce.</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[#F4F1EC]/65 sm:text-lg">
            Devět samostatných webů pro beauty, gastro a lifestyle segment. Každý s vlastním
            vizuálem — někde rezervace, někde e-shop, někde portfolio. Bez domény, připravené
            na Vercel.
          </p>
        </header>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {brandsByBuildOrder.map((brand) => (
            <Link
              key={brand.slug}
              href={`/${brand.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.06]"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
                style={{ backgroundColor: brand.accent }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#F4F1EC]/45">
                      {brand.category} · {brand.city}
                    </p>
                    <h2 className="font-display mt-1 text-2xl">{brand.name}</h2>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider"
                    style={{
                      backgroundColor: `${brand.accent}22`,
                      color: brand.accent,
                    }}
                  >
                    #{brand.buildOrder} · {statusLabel[brand.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#F4F1EC]/55">{brand.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#F4F1EC]/40">{brand.description}</p>
                <div className="mt-4 text-[#F4F1EC]/70">
                  <FeaturePills features={brand.features} />
                </div>
                <p className="mt-5 text-sm font-medium text-[#B8956A] opacity-80 transition group-hover:opacity-100">
                  Otevřít demo →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 border-t border-white/8 pt-8 text-center text-sm text-[#F4F1EC]/35">
          <p>Všechny značky jsou fiktivní · pouze prezentační účely</p>
        </footer>
      </div>
    </div>
  );
}
