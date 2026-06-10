import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contourServices, getContourService } from "@/lib/contour-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return contourServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = getContourService(slug);
  if (!service) return {};
  return { title: `${service.name} · Contour Clinic` };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getContourService(slug);
  if (!service) notFound();

  return (
    <div className="bg-[#f9f6f1]">
      <section className="relative min-h-[55vh] overflow-hidden pt-28 md:pt-32">
        <Image src={service.image} alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
        <div className="relative mx-auto max-w-[90rem] px-5 pb-16 sm:px-8">
          <Link
            href="/contour-clinic#sluzby"
            className="text-[10px] uppercase tracking-[0.28em] text-white/45 hover:text-white"
          >
            ← Služby
          </Link>
          {service.bestseller && (
            <span className="contour-ribbon relative mt-8 inline-block">Bestseller</span>
          )}
          <h1 className="contour-headline contour-headline-lg mt-8 text-white">{service.name}</h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-white/65">
            {service.intro}
          </p>
          <p className="mt-6 font-serif text-xl italic text-white/90">od {service.priceFrom}</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="contour-headline text-3xl">Techniky & protokoly</h2>
            <div className="mt-10 space-y-8">
              {service.techniques.map((t) => (
                <div key={t.name} className="border-b border-black/6 pb-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em]">{t.name}</h3>
                  <p className="contour-body mt-3 text-sm">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit bg-[#fffdf9] p-8">
            <p className="contour-label">Proč u nás</p>
            <ul className="mt-6 space-y-4">
              {service.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-[#0a0a0a]/65">
                  <span className="text-[var(--c-gold)]">✦</span>
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/contour-clinic/rezervace" className="contour-btn mt-10 w-full justify-center">
              Rezervovat
            </Link>
            <Link
              href="/contour-clinic/cenik"
              className="mt-4 block text-center text-[10px] uppercase tracking-widest text-[#0a0a0a]/40 hover:text-[#0a0a0a]"
            >
              Ceník
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
