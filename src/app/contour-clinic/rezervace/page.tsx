import Link from "next/link";
import { BookingDemo } from "@/components/BookingDemo";
import { contourBooking } from "@/lib/site-data";

export const metadata = {
  title: "Rezervace · Contour Clinic",
};

export default function RezervacePage() {
  return (
    <div className="bg-[var(--c-cream)] px-5 pb-24 pt-28 sm:px-8 md:pt-36">
      <div className="mx-auto max-w-lg text-center">
        <p className="contour-kicker">První krok</p>
        <h1 className="contour-headline contour-headline-md mt-3">Rezervace</h1>
        <p className="contour-body mt-4 text-sm">
          Vyberte službu, termín a odešlete požadavek.
        </p>
        <div className="mt-12 border border-[var(--c-line)] bg-[var(--c-cream)] p-7 sm:p-9">
          <BookingDemo services={contourBooking} accent="#C4A062" />
        </div>
        <p className="contour-body mt-8 text-center text-xs">
          <Link href="/contour-clinic/cenik" className="underline underline-offset-4">
            Zobrazit ceník
          </Link>
        </p>
      </div>
    </div>
  );
}
