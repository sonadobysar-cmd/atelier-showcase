import { ServiceCatalog } from "@/components/ServiceCatalog";
import { sknTtServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("skn-tt")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Nabídka</h1>
      <div className="mt-12">
        <ServiceCatalog groups={sknTtServices} accent={brand.accent} />
      </div>
    </div>
  );
}
