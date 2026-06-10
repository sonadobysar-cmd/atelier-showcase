import { BookingDemo } from "@/components/BookingDemo";
import { getBrand } from "@/lib/brands";
import { sknTtBooking } from "@/lib/site-data";

const brand = getBrand("skn-tt")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Walk-in & rezervace</h1>
      <p className="mt-2 text-sm opacity-55">
        Fine line motivy do 10 cm bez objednání — dle volné kapacity. Větší projekty rezervujte.
      </p>
      <div className="mt-10">
        <BookingDemo services={sknTtBooking} accent={brand.accent} />
      </div>
    </div>
  );
}
