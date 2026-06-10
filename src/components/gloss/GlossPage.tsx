"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GlossBooking } from "@/components/gloss/GlossBooking";
import { GlossEffects } from "@/components/gloss/GlossEffects";
import { GlossFields } from "@/components/gloss/GlossFields";
import { GlossLogo } from "@/components/gloss/GlossLogo";
import { GlossMirrors } from "@/components/gloss/GlossMirrors";
import { GlossPlayground } from "@/components/gloss/GlossPlayground";
import { GlossReveal } from "@/components/gloss/GlossReveal";
import { GlossScratchCard } from "@/components/gloss/GlossScratchCard";
import { GlossBeforeAfter } from "@/components/gloss/GlossBeforeAfter";
import { glossMapSvg } from "@/lib/gloss-art";
import { glossContact, glossFields, glossMarqueeItems } from "@/lib/gloss-data";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function GlossPage() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedProc, setSelectedProc] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reserve = (procedureName: string) => {
    setSelectedProc(procedureName);
    scrollToId("rezervace");
  };

  return (
    <div className="gloss-site">
      <GlossEffects />
      <GlossScratchCard />

      <nav id="nav" className={scrolled ? "scrolled" : ""}>
        <GlossLogo />
        <div className="nav-links">
          <a href="#vyzkousej" onClick={(e) => { e.preventDefault(); scrollToId("vyzkousej"); }}>Vyzkoušej</a>
          <a href="#obory" onClick={(e) => { e.preventDefault(); scrollToId("obory"); }}>Obory</a>
          <a href="#cenik" onClick={(e) => { e.preventDefault(); scrollToId("cenik"); }}>Ceník</a>
          <a href="#kontakt" onClick={(e) => { e.preventDefault(); scrollToId("kontakt"); }}>Kontakt</a>
          <a href="#rezervace" onClick={(e) => { e.preventDefault(); scrollToId("rezervace"); }}>Rezervace</a>
        </div>
        <div className="nav-actions">
          <button type="button" className="book-btn" onClick={() => scrollToId("rezervace")}>
            Rezervovat
          </button>
          <button type="button" className="burger" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <header className="hero-header">
        <div className="hero-copy">
          <div className="eyebrow">Praha · Atelier de Beauté · Od 2026</div>
          <h1 className="hero-title">
            <span className="line">
              <span>Probuď se</span>
            </span>
            <span className="line script-line">
              <span>
                <em className="shine">krásná</em>
              </span>
            </span>
            <span className="line">
              <span>zůstaň IN.</span>
            </span>
          </h1>
          <p className="hero-sub">
            Lash lifting, brow bar, kosmetologie a prodlužování řas. Glossy výsledky, které mluví za
            vše — a welcome drink vždycky gratis.
          </p>
          <div className="hero-cta">
            <button type="button" className="solid" onClick={() => scrollToId("rezervace")}>
              Rezervovat termín
            </button>
            <button type="button" className="ghost" onClick={() => scrollToId("vyzkousej")}>
              Vyzkoušej si look
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <Image
            src="/images/gloss/hero.png"
            alt="GLOSS — atelier de beauté"
            fill
            priority
            className="hero-figure-img"
            sizes="(max-width: 900px) 100vw, 62vw"
          />
          <div className="free-tag">
            <div className="ring">
              <span>
                <b>♥</b>
                Welcome drink
                <br />
                vždy gratis
              </span>
            </div>
          </div>
        </div>

        <div className="scroll-hint">
          <span className="dot" />
          Scrolluj dolů
        </div>
      </header>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...glossMarqueeItems, ...glossMarqueeItems].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>

      <GlossPlayground onReserve={reserve} />

      <GlossReveal>
        <GlossBeforeAfter />
      </GlossReveal>

      <section id="obory">
        <GlossReveal>
          <div className="sec-head">
            <div className="sec-eyebrow">Naše obory</div>
            <h2 className="sec-title">
              Čtyři <em className="shine">světy</em> krásy
            </h2>
            <p className="sec-note">Klikni na obor a rozbalí se ti jednotlivé procedury, info a ceny.</p>
          </div>
        </GlossReveal>
        <GlossReveal>
          <GlossFields onReserve={reserve} />
        </GlossReveal>
      </section>

      <section id="cenik">
        <GlossReveal>
          <div className="sec-head">
            <div className="sec-eyebrow">Ceník</div>
            <h2 className="sec-title">
              Vše <em className="shine">přehledně</em>
            </h2>
          </div>
        </GlossReveal>
        <GlossReveal>
          <div className="price-table">
            {glossFields.map((field) => (
              <div key={field.id} className="price-cat">
                <h3>{field.name}</h3>
                {field.procedures.map((p) => (
                  <div key={p.name} className="price-row">
                    <span className="nm">
                      {p.name}
                      <small>{p.duration}</small>
                    </span>
                    <span className="vl">{p.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </GlossReveal>
      </section>

      <section id="galerie" className="gloss-mirrors-section">
        <GlossReveal>
          <div className="sec-head">
            <div className="sec-eyebrow">Signature prostor</div>
            <h2 className="sec-title">
              Vlnitá zrcadla, ve kterých <em className="shine">záříš</em>
            </h2>
            <p className="sec-note">Naše klientky — glossy výsledky, které mluví za vše.</p>
          </div>
        </GlossReveal>
        <GlossReveal>
          <GlossMirrors />
        </GlossReveal>
      </section>

      <section id="kontakt">
        <div className="contact-grid">
          <GlossReveal>
            <div className="contact-info">
              <div className="sec-eyebrow">Kontakt</div>
              <h2>
                Najdeš nás <em className="shine">v centru</em> Prahy
              </h2>
              <div className="contact-line">
                <span className="ic">⌖</span>
                <div>
                  <b>{glossContact.address}</b>
                  <small>{glossContact.addressNote}</small>
                </div>
              </div>
              <div className="contact-line">
                <span className="ic">☎</span>
                <div>
                  <b>{glossContact.phone}</b>
                  <small>{glossContact.phoneNote}</small>
                </div>
              </div>
              <div className="contact-line">
                <span className="ic">✉</span>
                <div>
                  <b>{glossContact.email}</b>
                  <small>{glossContact.emailNote}</small>
                </div>
              </div>
              <div className="contact-line">
                <span className="ic">◷</span>
                <div>
                  <b>{glossContact.hours}</b>
                  <small>{glossContact.hoursNote}</small>
                </div>
              </div>
            </div>
          </GlossReveal>
          <GlossReveal>
            <div className="map-card" dangerouslySetInnerHTML={{ __html: glossMapSvg }} />
          </GlossReveal>
        </div>
      </section>

      <GlossBooking selectedProc={selectedProc} onSelectProc={setSelectedProc} />

      <footer>
        <GlossLogo />
        <div className="foot-links">
          <a href="#obory" onClick={(e) => { e.preventDefault(); scrollToId("obory"); }}>Obory</a>
          <a href="#cenik" onClick={(e) => { e.preventDefault(); scrollToId("cenik"); }}>Ceník</a>
          <a href="#kontakt" onClick={(e) => { e.preventDefault(); scrollToId("kontakt"); }}>Kontakt</a>
          <a href="#rezervace" onClick={(e) => { e.preventDefault(); scrollToId("rezervace"); }}>Rezervace</a>
          <a href="#">Instagram</a>
        </div>
        <small>
          Atelier de Beauté · {glossContact.address} · út–ne 9–19 · welcome drink vždy gratis
        </small>
        <small style={{ marginTop: 8 }}>© {new Date().getFullYear()} GLOSS. Vyrobeno s láskou, růžovou a třpytem.</small>
        <a href="/" className="gloss-demo-link">
          ← Portfolio demo
        </a>
      </footer>
    </div>
  );
}
