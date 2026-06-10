"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Brand } from "@/lib/brands";

const nav = [
  { href: "/contour-clinic#sluzby", label: "Služby" },
  { href: "/contour-clinic/cenik", label: "Ceník" },
  { href: "/contour-clinic#gallery", label: "Galerie" },
  { href: "/contour-clinic/rezervace", label: "Rezervace" },
] as const;

export function ContourShell({ brand, children }: { brand: Brand; children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/contour-clinic";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solidHeader = !isHome || scrolled;

  return (
    <div className="contour-site">
      <header
        className={`contour-nav fixed inset-x-0 top-0 z-50 flex items-center justify-between px-10 py-6 transition-all duration-500 max-sm:px-[22px] max-sm:py-[18px] ${
          solidHeader ? "contour-nav--solid" : ""
        }`}
      >
        <Link href="/contour-clinic" className="contour-logo">
          Contour<small>Clinic</small>
        </Link>
        <nav className="contour-nav-desktop hidden items-center gap-[34px] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="contour-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/contour-clinic/rezervace" className="contour-btn contour-btn-gold !px-6 !py-[13px]">
            Rezervovat
          </Link>
        </nav>
        <Link
          href="/contour-clinic/rezervace"
          className="contour-btn contour-btn-gold !px-5 !py-3 text-[0.58rem] lg:hidden"
        >
          Rezervovat
        </Link>
      </header>

      <main>{children}</main>

      <footer id="kontakt" className="contour-foot">
        <div className="contour-wrap">
          <div className="contour-foot-grid">
            <div>
              <Link href="/contour-clinic" className="contour-logo">
                Contour<small>Clinic</small>
              </Link>
              <p className="contour-foot-tagline">{brand.tagline}</p>
            </div>
            <div>
              <h5>Klinika</h5>
              <ul>
                <li>
                  <Link href="/contour-clinic#sluzby">Služby</Link>
                </li>
                <li>
                  <Link href="/contour-clinic/cenik">Ceník</Link>
                </li>
                <li>
                  <Link href="/contour-clinic#gallery">Galerie</Link>
                </li>
                <li>
                  <Link href="/contour-clinic/rezervace">Rezervace</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5>Kontakt</h5>
              <ul>
                <li>Vinohradská 42, Praha 2</li>
                <li>
                  <a href="tel:+420777123456">+420 777 123 456</a>
                </li>
                <li>
                  <a href="mailto:info@contourclinic.cz">info@contourclinic.cz</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Otevírací doba</h5>
              <ul>
                <li>Po–Pá &nbsp; 9:00–20:00</li>
                <li>So &nbsp; 9:00–14:00</li>
                <li>Ne &nbsp; zavřeno</li>
                <li style={{ marginTop: "0.5rem", color: "var(--c-gold-soft)" }}>Konzultace zdarma</li>
              </ul>
            </div>
          </div>
          <div className="contour-foot-bottom">
            <span>© {new Date().getFullYear()} Contour Clinic. Všechna práva vyhrazena.</span>
            <span>Zdravotnická estetická klinika · Praha</span>
          </div>
          <Link
            href="/"
            className="mt-8 inline-block text-xs opacity-35 hover:opacity-60"
            style={{ color: "#9b917f" }}
          >
            ← Portfolio demo
          </Link>
        </div>
      </footer>
    </div>
  );
}
