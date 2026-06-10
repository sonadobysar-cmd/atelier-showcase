import { ShopDemo } from "@/components/ShopDemo";
import { getBrand } from "@/lib/brands";
import { coffeeProducts } from "@/lib/site-data";

const brand = getBrand("caffeholic")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Káva domů</h1>
      <p className="mt-2 opacity-60">Výběrové pražení CaffeHolic.</p>
      <div className="mt-10">
        <ShopDemo products={coffeeProducts} accent={brand.accent} />
      </div>
    </div>
  );
}
