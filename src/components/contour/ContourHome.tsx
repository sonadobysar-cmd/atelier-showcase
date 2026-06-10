import Link from "next/link";
import { ContourHero } from "@/components/contour/ContourHero";
import { ContourStats } from "@/components/contour/ContourStats";
import { ContourMarquee } from "@/components/contour/ContourMarquee";
import { ContourReveal } from "@/components/contour/ContourReveal";
import { contourServices, contourWhyItems } from "@/lib/contour-data";

const GALLERY_MARKS = ["C", "O", "N", "T"] as const;

export function ContourHome() {
  return (
    <>
      <ContourHero />
      <ContourStats />
      <ContourMarquee />

      <section className="contour-sec contour-sec--alt" id="sluzby">
        <div className="contour-wrap">
          <ContourReveal>
            <div className="contour-sec-head">
              <span className="contour-kicker">Naše služby</span>
              <h2 className="contour-headline contour-headline-xl">Ošetření na míru vaší kráse</h2>
              <p>
                Každý zákrok navrhujeme individuálně — s citem pro proporce, přirozenost a vaše
                přání.
              </p>
            </div>
          </ContourReveal>

          <div className="contour-services">
            {contourServices.map((service) => (
              <ContourReveal key={service.slug}>
                <Link
                  href={`/contour-clinic/sluzby/${service.slug}`}
                  className={`contour-card ${service.bestseller ? "contour-card--featured" : ""}`}
                >
                  <div className="contour-card-media">
                    {service.bestseller && <span className="contour-ribbon">Bestseller</span>}
                    <div className="contour-ph">
                      <span className="contour-ph-mark">{service.mark}</span>
                    </div>
                  </div>
                  <div className="contour-card-body">
                    <span className="contour-card-num">{service.category}</span>
                    <h3 className="contour-card-title">{service.name}</h3>
                    <p className="contour-card-desc">{service.shortDesc}</p>
                    <span className="contour-card-more">
                      Zobrazit <span className="contour-btn-ar">→</span>
                    </span>
                  </div>
                </Link>
              </ContourReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="contour-why" id="proc-my">
        <div className="contour-wrap">
          <div className="contour-why-top">
            <ContourReveal>
              <span className="contour-kicker">Proč Contour Clinic</span>
              <h2>
                Postaveno z lásky ke kráse{" "}
                <span className="contour-script" style={{ color: "var(--c-gold)" }}>
                  a sebevědomí.
                </span>
              </h2>
            </ContourReveal>
            <ContourReveal delay={80}>
              <p>
                Nejsme jen salon. Jsme zdravotnická klinika, kde světové techniky a špičkové
                technologie slouží jedinému cíli — abyste se cítila sama sebou, jen o něco
                sebevědoměji.
              </p>
            </ContourReveal>
          </div>

          <div className="contour-why-grid">
            {contourWhyItems.map((item, i) => (
              <ContourReveal key={item.num} delay={i * 60} className="contour-why-item">
                <div className="contour-why-num">{item.num}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </ContourReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="contour-sec" id="gallery">
        <div className="contour-wrap">
          <ContourReveal>
            <div className="contour-sec-head">
              <span className="contour-kicker">Naše práce</span>
              <h2 className="contour-headline contour-headline-xl">Galerie výsledků</h2>
              <p>
                Decentní, přirozené proměny. Skutečné fotografie doplníme — sem patří vaše portfolio
                před/po.
              </p>
            </div>
          </ContourReveal>

          <div className="contour-gallery">
            {GALLERY_MARKS.map((mark, i) => (
              <ContourReveal key={mark} delay={i * 50} className="contour-gallery-item">
                <div className="contour-ph">
                  <span className="contour-ph-mark">{mark}</span>
                  <span className="contour-ph-note">Naše práce</span>
                </div>
              </ContourReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="contour-cta-band">
        <div className="contour-wrap">
          <ContourReveal>
            <span className="contour-kicker">Začněte u konzultace</span>
            <h2>
              Vaše proměna začíná
              <span className="contour-script">jedním rozhovorem.</span>
            </h2>
            <p>
              Nezávazná konzultace zdarma. Probereme vaše přání, navrhneme plán a ukážeme, co je pro
              vás to pravé.
            </p>
            <Link href="/contour-clinic/rezervace" className="contour-btn contour-btn-gold">
              Rezervovat konzultaci <span className="contour-btn-ar">→</span>
            </Link>
          </ContourReveal>
        </div>
      </section>
    </>
  );
}
