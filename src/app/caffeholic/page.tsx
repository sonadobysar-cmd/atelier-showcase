import Link from "next/link";
import { getBrand } from "@/lib/brands";

const brand = getBrand("caffeholic")!;

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{brand.name}</h1>
        <p className="mt-4 text-lg opacity-70">{brand.tagline}</p>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed opacity-60">
          Specialty káva, sezónní nabídka a výběrové pražení k odnášení domů.
        </p>
        <Link
          href="/caffeholic/menu"
          className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brand.accent }}
        >
          Dnešní menu
        </Link>
      </div>
    </section>
  );
}
