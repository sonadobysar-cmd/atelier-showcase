"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GlossMirrorGlow } from "@/components/gloss/GlossMirrorGlow";
import {
  normalizeIngredients,
  resolveCustomRitual,
  ritualIngredients,
  type RitualIngredientId,
} from "@/lib/gloss-ritual";

type Props = {
  onReserve: (procedureName: string) => void;
};

type Phase = "compose" | "fog" | "revealed";

function drawFogBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(248, 242, 246, 0.97)";
  ctx.fillRect(0, 0, w, h);

  const steam = ctx.createLinearGradient(0, 0, 0, h);
  steam.addColorStop(0, "rgba(255,255,255,0.92)");
  steam.addColorStop(0.35, "rgba(255,252,254,0.88)");
  steam.addColorStop(0.7, "rgba(245, 232, 240, 0.9)");
  steam.addColorStop(1, "rgba(238, 220, 230, 0.94)");
  ctx.fillStyle = steam;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 6; i++) {
    const cx = w * (0.15 + i * 0.14);
    const cy = h * (0.25 + (i % 3) * 0.18);
    const r = w * (0.22 + (i % 2) * 0.08);
    const mist = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    mist.addColorStop(0, "rgba(255,255,255,0.55)");
    mist.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawFingerHint(ctx: CanvasRenderingContext2D, w: number, h: number, lines: string[]) {
  const size = Math.min(w * 0.078, 30);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${size}px "Ballet", "Brush Script MT", cursive`;
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "rgba(175, 145, 158, 0.72)";

  const startY = h * 0.38 - ((lines.length - 1) * size * 0.55) / 2;
  lines.forEach((line, i) => {
    const y = startY + i * size * 1.1;
    const wobble = Math.sin(i * 1.2) * 2;
    ctx.fillText(line, w * 0.5 + wobble, y);
  });

  ctx.shadowBlur = 0;
  ctx.font = `400 ${size * 0.55}px "Ballet", cursive`;
  ctx.fillStyle = "rgba(190, 160, 172, 0.45)";
  ctx.fillText("♥", w * 0.72, h * 0.72);
  ctx.restore();
}

function drawFog(ctx: CanvasRenderingContext2D, w: number, h: number, hint: string[]) {
  drawFogBase(ctx, w, h);
  drawFingerHint(ctx, w, h, hint);
}

export function GlossSignatureRitual({ onReserve }: Props) {
  const [picked, setPicked] = useState<RitualIngredientId[]>([]);
  const [phase, setPhase] = useState<Phase>("compose");
  const [fogOpacity, setFogOpacity] = useState(1);

  const fogRef = useRef<HTMLCanvasElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const wipingRef = useRef(false);

  const result = useMemo(() => resolveCustomRitual(picked), [picked]);
  const canOpen = picked.length > 0 && phase === "compose";

  const fogHint = useMemo(() => {
    if (phase === "compose") return ["Vyber si vedle", "→"];
    return ["Přejeď prstem", "po zrcadle"];
  }, [phase]);

  const toggle = (id: RitualIngredientId) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return normalizeIngredients([...prev, id]);
    });
  };

  const setupFog = useCallback(() => {
    const canvas = fogRef.current;
    const glass = glassRef.current;
    if (!canvas || !glass) return;
    const rect = glass.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFog(ctx, rect.width, rect.height, fogHint);
    setFogOpacity(1);
  }, [fogHint]);

  const openMirror = useCallback(() => {
    if (!canOpen) return;
    setPhase("fog");
  }, [canOpen]);

  useEffect(() => {
    if (phase === "revealed") return;
    const raf = requestAnimationFrame(setupFog);
    window.addEventListener("resize", setupFog);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setupFog);
    };
  }, [phase, setupFog]);

  const wipeAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = fogRef.current;
      if (!canvas || phase !== "fog") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const r = 44;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(0,0,0,0.9)");
      grad.addColorStop(0.55, "rgba(0,0,0,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    [phase],
  );

  const finishReveal = useCallback(() => {
    setFogOpacity(0);
    window.setTimeout(() => setPhase("revealed"), 420);
  }, []);

  const checkFogCleared = useCallback(() => {
    const canvas = fogRef.current;
    if (!canvas || phase !== "fog") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const sample = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    const step = 18;
    for (let i = 3; i < sample.length; i += 4 * step) {
      if (sample[i]! < 40) cleared++;
    }
    const ratio = cleared / (sample.length / (4 * step));
    if (ratio > 0.26) finishReveal();
  }, [finishReveal, phase]);

  const reset = () => {
    setPicked([]);
    setPhase("compose");
    setFogOpacity(1);
  };

  const showFog = phase !== "revealed";
  const fogInteractive = phase === "fog";

  return (
    <section id="vyzkousej" className="gloss-playground gloss-lab gloss-ritual-lab">
      <div className="sec-head gloss-lab-head">
        <div className="sec-eyebrow">Signature experience</div>
        <h2 className="sec-title">
          Zrcadlo <em className="shine">rituálu</em>
        </h2>
        <p className="sec-note">
          Vyber procedury vedle zrcadla. Po zamlžení přejeď prstem — odhalíš svůj look.
        </p>
      </div>

      <div className="playground-grid gloss-lab-grid gloss-ritual-grid">
        <div className="playground-mirror-wrap gloss-ritual-mirror-col">
          <div
            className={`gloss-mirror gloss-ritual-mirror${picked.length ? " is-engaged" : ""}${phase === "revealed" ? " is-revealed" : ""}${showFog ? " is-fogged" : ""}`}
          >
            <div className="gloss-mirror-rim" aria-hidden />
            <div ref={glassRef} className="gloss-mirror-glass gloss-ritual-glass">
              <GlossMirrorGlow picked={picked} phase={phase} />

              {phase === "revealed" && <div className="gloss-mirror-sweep" aria-hidden />}

              {showFog && (
                <canvas
                  ref={fogRef}
                  className={`gloss-fog-canvas${fogInteractive ? " is-wipeable" : " is-idle"}`}
                  style={{ opacity: fogOpacity, transition: "opacity .45s ease" }}
                  aria-label={fogInteractive ? "Vyčisti mlhu na zrcadle" : "Zrcadlo zamlžené — vyber procedury vedle"}
                  onPointerDown={(e) => {
                    if (!fogInteractive) return;
                    wipingRef.current = true;
                    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
                    wipeAt(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (!wipingRef.current || !fogInteractive) return;
                    wipeAt(e.clientX, e.clientY);
                    checkFogCleared();
                  }}
                  onPointerUp={() => {
                    wipingRef.current = false;
                    checkFogCleared();
                  }}
                />
              )}
            </div>
          </div>

          {phase === "revealed" && (
            <p className="gloss-ritual-mirror-hint" aria-live="polite">
              Tvůj rituál je připravený — detaily vpravo.
            </p>
          )}
        </div>

        <div className="playground-panel gloss-ritual-panel" aria-live={phase === "revealed" ? "polite" : "off"}>
          {phase === "compose" && (
            <>
              <p className="gloss-ritual-panel-label">Tvůj výběr</p>
              <p className="gloss-ritual-panel-lead">
                Lifting a prodlužování nelze kombinovat. Ostatní procedury lze skládat.
              </p>

              <ul className="gloss-ritual-picks">
                {ritualIngredients.map((ing) => {
                  const active = picked.includes(ing.id);
                  return (
                    <li key={ing.id}>
                      <button
                        type="button"
                        className={`gloss-ritual-pick${active ? " is-on" : ""}`}
                        onClick={() => toggle(ing.id)}
                        aria-pressed={active}
                      >
                        <span className="gloss-ritual-pick-num">{ing.num}</span>
                        <span className="gloss-ritual-pick-copy">
                          <strong>{ing.label}</strong>
                          <em>{ing.hint}</em>
                        </span>
                        <span className="gloss-ritual-pick-ring" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button type="button" className="gloss-ritual-cta" disabled={!canOpen} onClick={openMirror}>
                Zamlžit zrcadlo
              </button>
            </>
          )}

          {phase === "fog" && result && (
            <div className="gloss-ritual-wait">
              <p className="gloss-ritual-panel-label">Pod mlhou čeká tvůj look</p>
              <p className="gloss-ritual-panel-lead">
                Pomalý tah po skle — jako po horké sprše v atelieru.
              </p>
              <ul className="gloss-ritual-fog-picks">
                {picked.map((id) => {
                  const ing = ritualIngredients.find((x) => x.id === id);
                  if (!ing) return null;
                  return (
                    <li key={id}>
                      <span>{ing.num}</span> {ing.label}
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="playground-btn ghost gloss-ritual-back" onClick={reset}>
                Změnit výběr
              </button>
            </div>
          )}

          {phase === "revealed" && result && (
            <div className="gloss-ritual-result-block">
              <p className="gloss-ritual-result-badge">{result.look.badge}</p>
              <p className="gloss-ritual-panel-label">Tvůj rituál</p>
              <h3 className="gloss-ritual-result-name">{result.look.procedure}</h3>
              <p className="gloss-ritual-result-sub">{result.look.label}</p>
              <p className="gloss-ritual-result-meta">
                {result.duration}
                <span aria-hidden>·</span>
                {result.priceHint}
              </p>

              <ol className="gloss-ritual-timeline">
                {result.ritual.map((s, i) => (
                  <li key={`${s.label}-${i}`}>
                    <span className="gloss-ritual-timeline-idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="gloss-ritual-timeline-copy">
                      <strong>{s.label}</strong>
                      <em>{s.detail}</em>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="playground-actions gloss-ritual-actions">
                <button type="button" className="gloss-ritual-cta" onClick={() => onReserve(result.look.procedure)}>
                  Rezervovat
                </button>
                <button type="button" className="playground-btn ghost" onClick={reset}>
                  Nový rituál
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
