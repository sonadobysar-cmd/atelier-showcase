import { ShopDemo } from "@/components/ShopDemo";
import { getBrand } from "@/lib/brands";
import { paulMitchellProducts } from "@/lib/site-data";

const brand = getBrand("hair-factory")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Paul Mitchell shop</h1>
      <p className="mt-2 opacity-60">Salonní produkty pro domácí péči.</p>
      <div className="mt-10">
        <ShopDemo products={paulMitchellProducts} accent={brand.accent} />
      </div>
    </div>
  );
}
