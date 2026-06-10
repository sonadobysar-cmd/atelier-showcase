import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("skn-tt")!;

export default function Page() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-5xl tracking-tight sm:text-6xl">SKN TT</h1>
        <p className="mt-6 text-lg opacity-70">{brand.tagline}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed opacity-55">
          Fine line tetování bez objednání — přijď v otevírací době. Specializace na jemné linky,
          piercing a kurátorované náušnice.
        </p>
        <Link
          href="/skn-tt/portfolio"
          className="mt-10 inline-block rounded-full border px-8 py-3 text-sm uppercase tracking-widest"
          style={{ borderColor: brand.accent, color: brand.accent }}
        >
          Portfolio
        </Link>
      </div>
    </section>
  );
}
