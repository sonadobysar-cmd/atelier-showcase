import { ServiceCatalog } from "@/components/ServiceCatalog";
import { revolutionPmuServices } from "@/lib/brand-content";
import { getBrand } from "@/lib/brands";

const brand = getBrand("revolution-of-beauty")!;

const academy = revolutionPmuServices.filter((g) => g.title === "Revolution Academy");

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Revolution Academy</h1>
      <p className="mt-2 opacity-60">PMU Masters a modulové kurzy jednotlivých technik.</p>
      <div className="mt-12">
        <ServiceCatalog groups={academy} accent={brand.accent} />
      </div>
    </div>
  );
}
