import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("hair-factory")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] opacity-50">Paul Mitchell® salon partner</p>
        <h1 className="font-display mt-5 text-4xl leading-tight sm:text-5xl">{brand.tagline}</h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed opacity-65">
          Autorské střihy a barvy, laminace, hair botox, keratin a prodlužování mikrokeratinem i
          tape-in pásky. Plus kurzy pro profesionály.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/hair-factory/rezervace"
            className="rounded-full px-7 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brand.accent }}
          >
            Rezervovat
          </Link>
          <Link href="/hair-factory/sluzby" className="rounded-full border border-black/15 px-7 py-3 text-sm">
            Služby
          </Link>
        </div>
      </div>
    </section>
  );
}
