import Link from "next/link";
import { contourPriceList } from "@/lib/contour-data";

export const metadata = {
  title: "Ceník · Contour Clinic",
};

export default function CenikPage() {
  return (
    <div className="bg-[var(--c-cream)] px-5 pb-24 pt-28 sm:px-8 md:pt-36">
      <div className="contour-wrap !px-0 mx-auto max-w-2xl">
        <p className="contour-kicker">Transparentní ceny</p>
        <h1 className="contour-headline contour-headline-lg mt-4">Ceník</h1>
        <p className="contour-body mt-5">
          Finální cena závisí na rozsahu zákroku. Úvodní konzultace vám dá přesný plán i kalkulaci.
        </p>

        <div className="mt-14 space-y-14">
          {contourPriceList.map((cat) => (
            <div key={cat.title}>
              <h2 className="contour-headline border-b border-black/8 pb-4 text-2xl">{cat.title}</h2>
              <div className="mt-3">
                {cat.rows.map((row) => (
                  <div key={row.name} className="contour-price-row">
                    <div>
                      <p className="text-sm font-medium">{row.name}</p>
                      {row.note && <p className="text-xs text-[#0a0a0a]/40">{row.note}</p>}
                    </div>
                    <p className="font-serif text-sm">{row.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#fffdf9] p-10 text-center">
          <p className="contour-quote text-2xl text-[#0a0a0a]">The right amount for you.</p>
          <Link href="/contour-clinic/rezervace" className="contour-btn contour-btn-gold mt-8">
            Rezervovat konzultaci <span className="contour-btn-ar">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
