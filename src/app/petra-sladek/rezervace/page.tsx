import { BookingDemo } from "@/components/BookingDemo";
import { getBrand } from "@/lib/brands";
import { coachServices } from "@/lib/site-data";

const brand = getBrand("petra-sladek")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Úvodní hovor</h1>
      <p className="mt-2 text-sm opacity-60">30 minut zdarma · bez závazku</p>
      <div className="mt-10">
        <BookingDemo services={coachServices} accent={brand.accent} />
      </div>
    </div>
  );
}
