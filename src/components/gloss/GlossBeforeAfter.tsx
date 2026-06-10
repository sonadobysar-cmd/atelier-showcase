"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Slide = {
  img: string;
  w: number;
  h: number;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  tag: string;
};

const SLIDES: Slide[] = [
  {
    img: "/images/gloss/lash-lifting.png",
    w: 1122,
    h: 1402,
    label: "Lash Lifting",
    beforeLabel: "Před",
    afterLabel: "Po lash liftingu",
    tag: "Zakřivení & délka",
  },
  {
    img: "/images/gloss/prodluzovani-ras.png",
    w: 1122,
    h: 1402,
    label: "Prodloužení řas",
    beforeLabel: "Před",
    afterLabel: "Po prodloužení",
    tag: "Dramatický efekt",
  },
  {
    img: "/images/gloss/brow-bar.png",
    w: 1122,
    h: 1402,
    label: "Brow Bar",
    beforeLabel: "Před",
    afterLabel: "Po laminaci",
    tag: "Definice & tvar",
  },
];

function Slider({ slide }: { slide: Slide }) {
  const [pos, setPos] = useState(50); // percent
  const [dragging, setDragging] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const toPercent = useCallback((clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      setRevealed(true);
      setPos(toPercent(e.clientX));
    },
    [toPercent],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPos(toPercent(e.clientX));
    },
    [dragging, toPercent],
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    setRevealed(true);
    if (e.key === "ArrowLeft") setPos((p) => Math.max(2, p - 3));
    if (e.key === "ArrowRight") setPos((p) => Math.min(98, p + 3));
  }, []);

  // Animate handle hint on first render
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`ba-slider${dragging ? " is-dragging" : ""}${revealed ? " is-revealed" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      tabIndex={0}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-label={`${slide.label} before/after`}
      onKeyDown={onKeyDown}
    >
      {/* AFTER — full image, always visible */}
      <div className="ba-after">
        <Image
          src={slide.img}
          alt={`Po — ${slide.label}`}
          fill
          sizes="(max-width: 600px) 100vw, 50vw"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
        <span className="ba-badge ba-badge-after">{slide.afterLabel}</span>
      </div>

      {/* BEFORE — same image desaturated, clipped to left */}
      <div className="ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={slide.img}
          alt={`Před — ${slide.label}`}
          fill
          sizes="(max-width: 600px) 100vw, 50vw"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          aria-hidden
        />
        <span className="ba-badge ba-badge-before">{slide.beforeLabel}</span>
      </div>

      {/* Divider handle */}
      <div className="ba-handle" style={{ left: `${pos}%` }} aria-hidden>
        <div className="ba-line" />
        <div className="ba-knob">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 10l-3.5 0M14 10l3.5 0M6 10l3-3M6 10l3 3M14 10l-3-3M14 10l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Hint arrows — shown before first interaction */}
      <div className="ba-hint" aria-hidden>
        <span>←</span>
        <span>přetáhni</span>
        <span>→</span>
      </div>
    </div>
  );
}

export function GlossBeforeAfter() {
  const [active, setActive] = useState(0);

  return (
    <section className="ba-section">
      <div className="ba-head">
        <p className="ba-eyebrow">Výsledky, které mluví za vše</p>
        <h2 className="ba-title">
          Před & <em>Po</em>
        </h2>
        <p className="ba-desc">
          Přetáhni jezdec a uvidíš rozdíl na vlastní oči.
        </p>
      </div>

      {/* Treatment tabs */}
      <div className="ba-tabs" role="tablist">
        {SLIDES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`ba-tab${active === i ? " active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="ba-tab-label">{s.label}</span>
            <span className="ba-tab-tag">{s.tag}</span>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="ba-stage">
        {SLIDES.map((s, i) => (
          <div key={s.label} className={`ba-slide${active === i ? " active" : ""}`} aria-hidden={active !== i}>
            <Slider slide={s} />
          </div>
        ))}
      </div>

      <p className="ba-cta-note">
        Líbí se ti výsledky?{" "}
        <a href="#booking" className="ba-cta-link">
          Rezervuj termín →
        </a>
      </p>
    </section>
  );
}
