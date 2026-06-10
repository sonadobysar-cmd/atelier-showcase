import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("revolution-of-beauty")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] opacity-50">PMU · Academy · Shop</p>
        <h1 className="font-display mt-4 text-3xl sm:text-4xl md:text-5xl">{brand.name}</h1>
        <p className="mx-auto mt-6 max-w-lg opacity-65">
          Pudrové techniky, vláskování, aquarelle lips a kurzy PMU Masters. E-shop s pigmenty a
          profesionálním vybavením.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/revolution-of-beauty/rezervace"
            className="rounded-full px-7 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brand.accent }}
          >
            Rezervovat PMU
          </Link>
          <Link href="/revolution-of-beauty/academy" className="rounded-full border border-black/15 px-7 py-3 text-sm">
            Academy
          </Link>
        </div>
      </div>
    </section>
  );
}
