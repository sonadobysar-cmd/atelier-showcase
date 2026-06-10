"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GlossMirrorGlow } from "@/components/gloss/GlossMirrorGlow";
import type { MirrorLookResult } from "@/lib/gloss-mirror-prompt";
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

function drawFog(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalCompositeOperation = "source-over";
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "rgba(255,255,255,0.78)");
  base.addColorStop(0.45, "rgba(255,248,252,0.82)");
  base.addColorStop(1, "rgba(245,228,236,0.88)");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const bloom = ctx.createRadialGradient(w * 0.5, h * 0.38, 0, w * 0.5, h * 0.45, w * 0.65);
  bloom.addColorStop(0, "rgba(255,255,255,0.55)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);
}

export function GlossSignatureRitual({ onReserve }: Props) {
  const [picked, setPicked] = useState<RitualIngredientId[]>([]);
  const [phase, setPhase] = useState<Phase>("compose");
  const [fogOpacity, setFogOpacity] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedSrc, setGeneratedSrc] = useState<string | null>(null);
  const [genNote, setGenNote] = useState<string | null>(null);

  const fogRef = useRef<HTMLCanvasElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const wipingRef = useRef(false);

  const result = useMemo(() => resolveCustomRitual(picked), [picked]);
  const canOpen = picked.length > 0 && phase === "compose";

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
    drawFog(ctx, rect.width, rect.height);
    setFogOpacity(1);
  }, []);

  const openMirror = useCallback(async () => {
    if (!canOpen || !result) return;

    setGenerating(true);
    setGenNote(null);
    setGeneratedSrc(null);

    try {
      const res = await fetch("/api/gloss/mirror-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: picked,
          procedure: result.look.procedure,
        }),
      });
      const data = (await res.json()) as MirrorLookResult;

      if (data.ok) {
        setGeneratedSrc(data.imageDataUrl);
        setGenNote("AI gloss look · Gemini");
      } else {
        setGenNote("Náhled ze salonu — pro AI nastav GEMINI_API_KEY");
      }
    } catch {
      setGenNote("Náhled ze salonu — generování se nepodařilo");
    } finally {
      setGenerating(false);
      setPhase("fog");
    }
  }, [canOpen, picked, result]);

  useEffect(() => {
    if (phase !== "fog") return;
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
      const r = 38;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(0,0,0,0.85)");
      grad.addColorStop(0.6, "rgba(0,0,0,0.25)");
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
    window.setTimeout(() => setPhase("revealed"), 480);
  }, []);

  const checkFogCleared = useCallback(() => {
    const canvas = fogRef.current;
    if (!canvas || phase !== "fog") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const sample = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    const step = 20;
    for (let i = 3; i < sample.length; i += 4 * step) {
      if (sample[i]! < 40) cleared++;
    }
    const ratio = cleared / (sample.length / (4 * step));
    if (ratio > 0.28) finishReveal();
  }, [finishReveal, phase]);

  const reset = () => {
    setPicked([]);
    setPhase("compose");
    setFogOpacity(1);
    setGenerating(false);
    setGeneratedSrc(null);
    setGenNote(null);
  };

  return (
    <section id="vyzkousej" className="gloss-playground gloss-lab gloss-ritual-lab">
      <div className="sec-head gloss-lab-head">
        <div className="sec-eyebrow">Signature experience</div>
        <h2 className="sec-title">
          Zrcadlo <em className="shine">rituálu</em>
        </h2>
        <p className="sec-note">
          Vyber až tři procedury. Zrcadlo se zamlží — ty ho vyčistíš a odhalíš svůj look.
        </p>
      </div>

      <div className="playground-grid gloss-lab-grid gloss-ritual-grid">
        <div className="playground-mirror-wrap gloss-ritual-mirror-col">
          <div
            className={`gloss-mirror gloss-ritual-mirror${picked.length ? " is-engaged" : ""}${phase === "revealed" ? " is-revealed" : ""}`}
          >
            <div className="gloss-mirror-rim" aria-hidden />
            <div ref={glassRef} className="gloss-mirror-glass gloss-ritual-glass">
              <GlossMirrorGlow
                picked={picked}
                phase={phase}
                generatedSrc={generatedSrc}
                generating={generating}
              />

              {phase === "revealed" && <div className="gloss-mirror-sweep" aria-hidden />}

              {phase === "fog" && (
                <canvas
                  ref={fogRef}
                  className="gloss-fog-canvas"
                  style={{ opacity: fogOpacity, transition: "opacity .5s ease" }}
                  aria-label="Vyčisti mlhu na zrcadle"
                  onPointerDown={(e) => {
                    wipingRef.current = true;
                    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
                    wipeAt(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (!wipingRef.current) return;
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

          {(phase === "fog" || phase === "revealed") && (
            <p className="gloss-ritual-mirror-hint" aria-live="polite">
              {phase === "fog" ? result?.message : "Zrcadlo je čisté — tvůj rituál je vpravo."}
            </p>
          )}
          {genNote && phase !== "compose" && <p className="gloss-ritual-gen-note">{genNote}</p>}
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

              <button
                type="button"
                className="gloss-ritual-cta"
                disabled={!canOpen || generating}
                onClick={() => void openMirror()}
              >
                {generating ? "Generuji look…" : "Vygenerovat & zamlžit"}
              </button>
            </>
          )}

          {phase === "fog" && (
            <div className="gloss-ritual-wait">
              <p className="gloss-ritual-panel-label">Vyčisti zrcadlo</p>
              <p className="gloss-ritual-panel-lead">
                Pomalý tah po skle — jako po horké sprše v atelieru. Pod mlhou čeká tvůj rituál.
              </p>
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
