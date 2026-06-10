import Link from "next/link";
import { getBrand } from "@/lib/brands";
import { yogaSchedule } from "@/lib/site-data";

const brand = getBrand("yoga-and-matcha")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Rozvrh</h1>
      <div className="mt-10 space-y-8">
        {yogaSchedule.map((day) => (
          <section key={day.day}>
            <h2 className="text-sm font-medium uppercase tracking-widest opacity-50">{day.day}</h2>
            <ul className="mt-3 divide-y divide-black/8">
              {day.classes.map((c) => (
                <li key={`${day.day}-${c.time}`} className="flex justify-between py-3">
                  <span>
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-sm opacity-50">{c.teacher}</span>
                  </span>
                  <span style={{ color: brand.accent }}>{c.time}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Link
        href="/yoga-and-matcha/rezervace"
        className="mt-10 inline-block rounded-full px-7 py-3 text-sm font-medium text-white"
        style={{ backgroundColor: brand.accent }}
      >
        Rezervovat
      </Link>
    </div>
  );
}
