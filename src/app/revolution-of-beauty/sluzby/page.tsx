import { ServiceCatalog } from "@/components/ServiceCatalog";
import { revolutionPmuServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("revolution-of-beauty")!;

const pmuOnly = revolutionPmuServices.filter((g) => g.title !== "Revolution Academy");

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">PMU služby</h1>
      <div className="mt-12">
        <ServiceCatalog groups={pmuOnly} accent={brand.accent} />
      </div>
    </div>
  );
}
