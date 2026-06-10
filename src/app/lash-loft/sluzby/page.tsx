import { ServiceCatalog } from "@/components/ServiceCatalog";
import { lashLoftServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("lash-loft")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Služby & ceník</h1>
      <div className="mt-12">
        <ServiceCatalog groups={lashLoftServices} accent={brand.accent} />
      </div>
    </div>
  );
}
