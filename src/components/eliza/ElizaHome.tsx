import Link from "next/link";
import { ElizaHomeNav } from "@/components/ElizaShell";

const IMG = {
  hero: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=2400&q=90",
  treat1: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&q=88",
  treat2: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=88",
  treat3: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=88",
  about: "https://images.unsplash.com/photo-1559837294-9b0f6aa16a49?w=900&q=88",
  edit: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=88",
  editorial: "https://images.unsplash.com/photo-1598440447625-96a46088edda?w=800&q=85",
  g1: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=82",
  g2: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&q=82",
  g3: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=82",
  g4: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=82",
  g5: "https://images.unsplash.com/photo-1598440447625-96a46088edda?w=500&q=82",
};

const shopItems = [
  { name: "Russian Lips", href: "/eliza-clinic/sluzby" },
  { name: "Dokonalý profil", href: "/eliza-clinic/sluzby" },
  { name: "Morpheus8®", href: "/eliza-clinic/sluzby" },
];

const treatments = [
  {
    title: "Injekční rty",
    desc: "Russian, Doll, Natural a Michelangelo lips.",
    image: IMG.treat1,
    light: false,
  },
  {
    title: "Botulotoxin",
    desc: "Baby Botox, lifting obočí, jawline.",
    image: IMG.treat2,
    light: true,
  },
  {
    title: "Morpheus8",
    desc: "PDRN, frakční RF, omlazení a epilace.",
    image: IMG.treat3,
    light: false,
  },
];

export function ElizaHome() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100dvh] bg-[#14100e]">
        <ElizaHomeNav />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMG.hero})` }}
        />
        <div className="absolute inset-x-0 bottom-[22%] sm:bottom-[24%]">
          <div className="eliza-hero-band py-9 sm:py-11 md:py-12">
            <h1 className="eliza-hero-logo text-center">Eliza Clinic</h1>
          </div>
        </div>
      </section>

      {/* SLUŽBY */}
      <section className="bg-white px-6 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-28">
        <h2 className="eliza-display mx-auto max-w-2xl text-center">
          Služby
          <br />
          pro dokonalou pleť
        </h2>

        <div className="mx-auto mt-[min(52vh,28rem)] grid max-w-3xl gap-8 sm:grid-cols-3 sm:gap-5">
          {shopItems.map((item) => (
            <div key={item.name}>
              <div className="eliza-product-box" />
              <p className="eliza-display eliza-display--xs mt-5 text-center">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center justify-between gap-6 sm:mt-16 sm:flex-row">
          {shopItems.map((item) => (
            <Link key={`cta-${item.name}`} href={item.href} className="flex items-center gap-2.5">
              <span className="eliza-display eliza-display--xs !transform-none !text-[0.62rem] !tracking-[0.12em]">
                {item.name}
              </span>
              <span className="eliza-arrow" aria-hidden>
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SIGNATURE */}
      <section className="bg-white px-3 pb-20 sm:px-4 md:pb-28">
        <h2 className="eliza-display eliza-display--sm text-center">Naše signature procedury</h2>
        <div className="mx-auto mt-10 grid max-w-[90rem] gap-0.5 sm:grid-cols-3">
          {treatments.map((t) => (
            <Link
              key={t.title}
              href="/eliza-clinic/sluzby"
              className={`eliza-treatment group block ${t.light ? "eliza-treatment--light" : ""}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${t.image})` }}
              />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-end gap-2">
                      <h3
                        className={`eliza-treatment-title ${t.light ? "text-[#111]" : "text-white"}`}
                      >
                        {t.title}
                      </h3>
                      <span className="eliza-arrow mb-0.5 shrink-0" aria-hidden>
                        ↗
                      </span>
                    </div>
                    <p
                      className={`eliza-treatment-desc mt-2 max-w-[11rem] ${
                        t.light ? "text-[#111]/80" : "text-white/88"
                      }`}
                    >
                      {t.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="o-nas" className="grid bg-white md:grid-cols-2">
        <div
          className="min-h-[460px] bg-cover bg-center md:min-h-[560px]"
          style={{ backgroundImage: `url(${IMG.about})` }}
        />
        <div className="flex flex-col justify-center px-8 py-16 sm:px-14 md:py-20 lg:px-20">
          <h2 className="eliza-display mx-auto max-w-xs text-center !text-[clamp(1.3rem,3vw,2rem)]">
            Pečlivě
            <br />
            a s precizí
          </h2>
          <p className="eliza-body mt-10 max-w-md">
            Za každým zákrokem stojí tým, který rozumí vědě o pleti i umění jemného zásahu. Naši
            lékaři kombinují klinickou praxi s precizním, individuálním přístupem.
          </p>
          <p className="eliza-body mt-4 max-w-md">
            Výjimečné výsledky začínají důvěrou. Poslechneme si vaše cíle a vytvoříme zážitek, který
            je stejně uklidňující jako promyšlený.
          </p>
          <Link href="/eliza-clinic#o-nas" className="eliza-btn-dark mt-10 w-fit">
            O nás
          </Link>
        </div>
      </section>

      {/* BANNER */}
      <section className="eliza-banner">
        <p className="eliza-display eliza-display--white !text-[clamp(1.1rem,2.6vw,1.7rem)] !tracking-[0.26em]">
          Jemně, ne přehnaně
        </p>
      </section>

      {/* EDITORIAL */}
      <section className="bg-[#111] px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
          <div>
            <h3 className="eliza-display eliza-display--white eliza-display--sm !text-left">
              Jemné zákroky,
              <br />
              viditelné výsledky
            </h3>
            <p className="mt-5 text-[10px] tracking-[0.2em] text-white/40">Červen 2026</p>
            <Link href="/eliza-clinic/sluzby" className="eliza-read-now mt-5 inline-block text-white/70">
              Číst více
            </Link>
          </div>
          <div>
            <h3 className="eliza-display eliza-display--white eliza-display--sm !text-left">
              Věda zářivé pleti
            </h3>
            <p className="mt-5 text-[10px] tracking-[0.2em] text-white/40">Březen 2026</p>
            <Link href="/eliza-clinic/sluzby" className="eliza-read-now mt-5 inline-block text-white/70">
              Číst více
            </Link>
          </div>
          <div>
            <div
              className="aspect-[4/3] bg-cover bg-center"
              style={{ backgroundImage: `url(${IMG.editorial})` }}
            />
            <h3 className="eliza-display eliza-display--white eliza-display--sm mt-6 !text-left">
              Medicína
              <br />
              a estetika
            </h3>
            <p className="mt-5 text-[10px] tracking-[0.2em] text-white/40">Květen 2026</p>
            <Link href="/eliza-clinic/sluzby" className="eliza-read-now mt-5 inline-block text-white/70">
              Číst více
            </Link>
          </div>
        </div>
      </section>

      {/* THE ELIZA EDIT */}
      <section id="kontakt" className="grid bg-white md:grid-cols-[1fr_40%]">
        <div className="flex flex-col justify-center px-8 py-20 sm:px-14 md:py-28 lg:px-20">
          <h2 className="eliza-edit-title">The Eliza Edit</h2>
          <p className="eliza-display mt-10 !text-[0.78rem] !tracking-[0.22em] sm:!text-[0.88rem]">
            Pozvedněte svůj skin ritual
          </p>
          <p className="eliza-body-serif mt-6 max-w-sm">
            Rezervujte úvodní konzultaci — 45 minut s lékařem, individuální plán péče a transparentní
            ceník.
          </p>
          <form className="mt-10 flex max-w-sm flex-col sm:flex-row" action="/eliza-clinic/rezervace">
            <input type="email" placeholder="E-mailová adresa" className="eliza-input flex-1" />
            <button type="submit" className="eliza-btn-dark whitespace-nowrap sm:-ml-px">
              Rezervovat
            </button>
          </form>
        </div>
        <div
          className="min-h-[340px] bg-cover bg-[center_30%] md:min-h-full"
          style={{ backgroundImage: `url(${IMG.edit})` }}
        />
      </section>

      {/* FOOTER */}
      <section className="bg-[#111] px-6 py-12 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <p className="eliza-footer-logo">Eliza</p>
          <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <Link href="/eliza-clinic" className="hover:text-white">
              Úvod
            </Link>
            <Link href="/eliza-clinic/rezervace" className="hover:text-white">
              Konzultace
            </Link>
            <Link href="/eliza-clinic#o-nas" className="hover:text-white">
              O nás
            </Link>
            <Link href="/eliza-clinic/rezervace" className="hover:text-white">
              Rezervace
            </Link>
            <Link href="/eliza-clinic/sluzby" className="hover:text-white">
              Služby
            </Link>
            <Link href="/" className="hover:text-white">
              Portfolio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-5">
        {[IMG.g1, IMG.g2, IMG.g3, IMG.g4, IMG.g5].map((src) => (
          <div
            key={src}
            className="aspect-square bg-cover bg-center"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </section>
    </>
  );
}
