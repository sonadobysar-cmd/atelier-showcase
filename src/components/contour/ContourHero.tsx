"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const HERO_BG = "/images/contour-clinic/hero-bg-ref.jpg";

export function ContourHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      bg.style.transform = `scale(1.08) translateY(${progress * 28}px)`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="contour-hero" id="top" ref={sectionRef}>
      <div className="contour-hero-media" ref={bgRef}>
        <Image
          src={HERO_BG}
          alt="Contour Clinic — recepce"
          fill
          priority
          className="contour-hero-bg"
          sizes="100vw"
        />
      </div>

      <div className="contour-hero-vignette" aria-hidden />
      <div className="contour-hero-frost" aria-hidden />
      <div className="contour-hero-shine" aria-hidden />

      <div className="contour-hero-inner">
        <div className="contour-hero-grid">
          <div className="contour-hero-col contour-glass">
            <div className="contour-hero-eyebrow">
              <span className="contour-hero-ln" aria-hidden />
              <span className="contour-kicker">Contour Clinic — Praha</span>
            </div>
            <h1 className="contour-hero-title">
              Dokonalost <span className="contour-hero-it">je</span> naše řemeslo
              <span className="contour-hero-script">sebevědomí naše poslání.</span>
            </h1>
            <p className="contour-hero-sub">
              Jediná zdravotnická estetická klinika, kde se světové techniky potkávají s láskou ke
              kráse. Přirozené výsledky pod odborným dohledem — od architektury rtů po Morpheus8.
            </p>
            <div className="contour-hero-cta">
              <Link href="/contour-clinic/rezervace" className="contour-btn contour-btn-gold">
                Rezervovat konzultaci <span className="contour-btn-ar">→</span>
              </Link>
              <Link href="#sluzby" className="contour-btn contour-btn-ghost">
                Naše služby
              </Link>
            </div>
          </div>

          <div className="contour-hero-visual" aria-hidden>
            <div className="contour-hero-arch">
              <div className="contour-ph contour-ph--hero">
                <span className="contour-ph-mark">C</span>
                <span className="contour-ph-note">AI portrét · brzy</span>
              </div>
            </div>
            <div className="contour-hero-badge">
              <b>15+</b>
              světových technologií
            </div>
          </div>
        </div>
      </div>

      <div className="contour-hero-scroll" aria-hidden>
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
