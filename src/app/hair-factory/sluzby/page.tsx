import { ServiceCatalog } from "@/components/ServiceCatalog";
import { hairFactoryServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("hair-factory")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Služby</h1>
      <p className="mt-2 opacity-60">Prémiová péče s Paul Mitchell produkty.</p>
      <div className="mt-12">
        <ServiceCatalog groups={hairFactoryServices.filter((g) => g.title !== "Kurzy HairFactory")} accent={brand.accent} />
      </div>
    </div>
  );
}
