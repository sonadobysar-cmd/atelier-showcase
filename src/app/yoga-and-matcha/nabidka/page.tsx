import { ServiceCatalog } from "@/components/ServiceCatalog";
import { yogaMatchaOffer } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("yoga-and-matcha")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Nabídka</h1>
      <p className="mt-2 opacity-60">Vstupy, permanentky, workshopy a retreat pobyty.</p>
      <div className="mt-12">
        <ServiceCatalog groups={yogaMatchaOffer} accent={brand.accent} />
      </div>
    </div>
  );
}
