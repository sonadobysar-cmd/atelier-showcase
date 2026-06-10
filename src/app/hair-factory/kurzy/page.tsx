import { ServiceCatalog } from "@/components/ServiceCatalog";
import { hairFactoryServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("hair-factory")!;

const kurzy = hairFactoryServices.filter((g) => g.title === "Kurzy HairFactory");

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">HairFactory Academy</h1>
      <p className="mt-2 opacity-60">Praktické kurzy pro kadeřníky — barva, prodlužování, techniky.</p>
      <div className="mt-12">
        <ServiceCatalog groups={kurzy} accent={brand.accent} />
      </div>
    </div>
  );
}
