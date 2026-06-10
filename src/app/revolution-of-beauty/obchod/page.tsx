import { ShopDemo } from "@/components/ShopDemo";
import { getBrand } from "@/lib/brands";
import { revolutionShopProducts } from "@/lib/site-data";

const brand = getBrand("revolution-of-beauty")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">E-shop pro PMU artisty</h1>
      <p className="mt-2 opacity-60">Pigmenty, strojky, cartridge jehly.</p>
      <div className="mt-10">
        <ShopDemo products={revolutionShopProducts} accent={brand.accent} />
      </div>
    </div>
  );
}
