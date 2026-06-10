"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  dismissScratchThisSession,
  isValidEmail,
  normalizeScratchEmail,
  readScratchClaim,
  saveScratchClaim,
  wasScratchDismissedThisSession,
  type GlossScratchClaim,
} from "@/lib/gloss-scratch";

type Phase = "locked" | "scratch" | "won";

type PendingPrize = {
  email: string;
  discount: number;
  code: string;
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function drawScratchFoil(ctx: CanvasRenderingContext2D, w: number, h: number, locked: boolean) {
  const foil = ctx.createLinearGradient(0, 0, w, h);
  foil.addColorStop(0, "#ffe0ef");
  foil.addColorStop(0.35, "#d8d8e4");
  foil.addColorStop(0.55, "#fff0f8");
  foil.addColorStop(1, "#ffc2de");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = foil;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 28; i++) {
    const x = (i * 47 + 13) % w;
    const y = (i * 31 + 19) % h;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.06})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,79,163,0.55)";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(locked ? "zadej email níže ♥" : "škrábej sem ♥", w / 2, h / 2 + 4);
}

export function GlossScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchingRef = useRef(false);
  const prizeRef = useRef<PendingPrize | null>(null);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("locked");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prize, setPrize] = useState<PendingPrize | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [savedClaim, setSavedClaim] = useState<GlossScratchClaim | null>(null);
  const [copied, setCopied] = useState(false);

  const canScratch = phase === "scratch" && !revealed;

  useEffect(() => {
    const claim = readScratchClaim();
    if (claim) {
      setSavedClaim(claim);
      return;
    }
    if (wasScratchDismissedThisSession()) return;
    const timer = window.setTimeout(() => setOpen(true), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    dismissScratchThisSession();
    setOpen(false);
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScratchFoil(ctx, rect.width, rect.height, phase === "locked");
  }, [phase]);

  useEffect(() => {
    if (!open || phase === "won") return;
    const raf = requestAnimationFrame(setupCanvas);
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [open, phase, setupCanvas]);

  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      if (!canScratch) return;
      const canvas = canvasRef.current;
      if (!canvas || revealed) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 8, y + 6, 14, 0, Math.PI * 2);
      ctx.fill();
    },
    [canScratch, revealed],
  );

  const checkReveal = useCallback(() => {
    if (!canScratch) return;
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const sample = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    const step = 16;
    for (let i = 3; i < sample.length; i += 4 * step) {
      if (sample[i]! < 40) cleared++;
    }
    const ratio = cleared / (sample.length / (4 * step));
    if (ratio > 0.38) {
      setRevealed(true);
      const p = prizeRef.current;
      if (p) {
        const claim = {
          email: p.email,
          discount: p.discount,
          code: p.code,
          claimedAt: new Date().toISOString(),
        };
        saveScratchClaim(claim);
        setSavedClaim(claim);
        setPhase("won");
      }
    }
  }, [canScratch, revealed]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canScratch) return;
    scratchingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!scratchingRef.current || !canScratch) return;
    scratchAt(e.clientX, e.clientY);
    if (Math.random() > 0.65) checkReveal();
  };

  const onPointerUp = () => {
    scratchingRef.current = false;
    checkReveal();
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = normalizeScratchEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Zadej platný email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gloss/scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = (await res.json()) as {
        discount?: number;
        code?: string;
        error?: string;
        reused?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo — zkus to znovu.");
        return;
      }
      const pending: PendingPrize = {
        email: normalized,
        discount: data.discount!,
        code: data.code!,
      };
      prizeRef.current = pending;
      setPrize(pending);

      if (data.reused) {
        const claim = {
          email: normalized,
          discount: pending.discount,
          code: pending.code,
          claimedAt: new Date().toISOString(),
        };
        saveScratchClaim(claim);
        setSavedClaim(claim);
        setRevealed(true);
        setPhase("won");
        return;
      }

      setRevealed(false);
      setPhase("scratch");
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!open && !savedClaim) return null;

  if (!open && savedClaim) {
    return (
      <button
        type="button"
        className="gloss-scratch-fab"
        onClick={() => {
          setPrize({
            email: savedClaim.email,
            discount: savedClaim.discount,
            code: savedClaim.code,
          });
          setPhase("won");
          setRevealed(true);
          setOpen(true);
        }}
        aria-label="Tvoje sleva"
      >
        <span aria-hidden>✦</span>
        −{savedClaim.discount}%
      </button>
    );
  }

  const showTeaser = phase === "locked";
  const displayPrize = prize ?? savedClaim;

  return (
    <div className="gloss-scratch-overlay" role="dialog" aria-modal="true" aria-labelledby="gloss-scratch-title">
      <div className="gloss-scratch-backdrop" onClick={close} aria-hidden />
      <div className="gloss-scratch-card">
        <button type="button" className="gloss-scratch-close" onClick={close} aria-label="Zavřít">
          ×
        </button>

        <div className="gloss-scratch-hearts" aria-hidden>
          <span>♥</span>
          <span>✦</span>
          <span>♥</span>
        </div>

        <p className="gloss-scratch-kicker">Pro nové hosty</p>
        <h2 id="gloss-scratch-title" className="gloss-scratch-title">
          {phase === "won" ? (
            "Gratulujeme!"
          ) : (
            <>
              Odškrtni si <em className="shine">slevu</em>
            </>
          )}
        </h2>
        {phase !== "won" && (
          <p className="gloss-scratch-lead">
            Sleva <strong>až 35&nbsp;%</strong> na první návštěvu — škrábej a zjisti svou.
          </p>
        )}

        <div
          className={`gloss-scratch-prize${revealed || phase === "won" ? " is-revealed" : ""}${phase === "locked" ? " is-locked" : ""}${phase === "scratch" ? " is-unlocked" : ""}`}
        >
          <div className="gloss-scratch-prize-inner">
            <span className="gloss-scratch-prize-tag">na první návštěvu</span>
            {showTeaser ? (
              <>
                <span className="gloss-scratch-prize-val gloss-scratch-prize-mystery">?</span>
                <span className="gloss-scratch-prize-teaser">až 35&nbsp;%</span>
              </>
            ) : displayPrize ? (
              <>
                <span className="gloss-scratch-prize-val">−{displayPrize.discount}%</span>
                <span className="gloss-scratch-prize-code">{displayPrize.code}</span>
              </>
            ) : null}
          </div>

          {phase !== "won" && (
            <>
              <canvas
                ref={canvasRef}
                className={`gloss-scratch-canvas${canScratch ? "" : " is-locked"}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                aria-label={
                  canScratch ? "Škrábací vrstva — odhal svou slevu" : "Škrábací kartička — nejdřív zadej email"
                }
              />
              {phase === "locked" && (
                <div className="gloss-scratch-lock" aria-hidden>
                  <span>✦</span>
                </div>
              )}
            </>
          )}
        </div>

        {phase === "won" && displayPrize && (
          <div className="gloss-scratch-won">
            <p>
              Kód <strong>{displayPrize.code}</strong> si ulož — uplatníš ho při rezervaci.
            </p>
            <div className="gloss-scratch-won-actions">
              <button type="button" className="gloss-scratch-cta" onClick={() => copyCode(displayPrize.code)}>
                {copied ? "Zkopírováno ✓" : "Kopírovat kód"}
              </button>
              <button
                type="button"
                className="gloss-scratch-cta ghost"
                onClick={() => {
                  close();
                  scrollToId("rezervace");
                }}
              >
                Rezervovat
              </button>
            </div>
          </div>
        )}

        {phase !== "won" && (
          <form className="gloss-scratch-form" onSubmit={(e) => void submitEmail(e)}>
            <label className="gloss-scratch-label" htmlFor="gloss-scratch-email">
              {phase === "locked" ? "Email pro odemčení škrábání" : "Email"}
            </label>
            <input
              id="gloss-scratch-email"
              type="email"
              autoComplete="email"
              placeholder="ty@gloss.cz"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={loading || phase === "scratch"}
            />
            {error && <p className="gloss-scratch-error">{error}</p>}
            {phase === "locked" ? (
              <button type="submit" className="gloss-scratch-cta" disabled={loading}>
                {loading ? "Odemykám…" : "Odemknout a škrábat ♥"}
              </button>
            ) : (
              <p className="gloss-scratch-hint">Škrábej pomalu po celé kartičce…</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
