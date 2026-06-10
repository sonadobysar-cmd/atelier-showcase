import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("lash-loft")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: brand.accent }}>
          Lash & brow bar
        </p>
        <h1 className="font-display mt-5 text-4xl sm:text-5xl">{brand.name}</h1>
        <p className="mx-auto mt-6 max-w-lg opacity-65">
          Korean lash lift, prodlužování řas a brow bar s laminací obočí — americké barvy s efektem
          PMU až na 3 týdny.
        </p>
        <Link
          href="/lash-loft/rezervace"
          className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brand.accent }}
        >
          Rezervovat
        </Link>
      </div>
    </section>
  );
}
