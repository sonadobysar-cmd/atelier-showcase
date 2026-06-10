import { BookingDemo } from "@/components/BookingDemo";
import { getBrand } from "@/lib/brands";
import { yogaBooking } from "@/lib/site-data";

const brand = getBrand("yoga-and-matcha")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Rezervace</h1>
      <div className="mt-10">
        <BookingDemo services={yogaBooking} accent={brand.accent} />
      </div>
    </div>
  );
}
