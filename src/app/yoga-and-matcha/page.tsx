import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("yoga-and-matcha")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{brand.name}</h1>
        <p className="mx-auto mt-6 max-w-lg opacity-65">
          Jóga, signature lekce Yoga & Matcha, permanentky, workshopy a víkendové retreat pobyty v
          přírodě.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/yoga-and-matcha/rozvrh"
            className="rounded-full px-7 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brand.accent }}
          >
            Rozvrh
          </Link>
          <Link href="/yoga-and-matcha/nabidka" className="rounded-full border border-black/15 px-7 py-3 text-sm">
            Permanentky & retreaty
          </Link>
        </div>
      </div>
    </section>
  );
}
