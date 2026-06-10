"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GlossLook } from "@/lib/gloss-data";
import {
  diagnostikaQuestions,
  resolveDiagnostika,
  type DiagnostikaAnswers,
  type FocusId,
} from "@/lib/gloss-diagnostika";
import { GlossMirrorViz } from "@/components/gloss/GlossMirrorViz";

type Props = {
  onReserve: (procedureName: string) => void;
};

function downloadGlossCard(look: GlossLook, score: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const g = ctx.createLinearGradient(0, 0, 600, 900);
  g.addColorStop(0, "#FFE8F4");
  g.addColorStop(0.5, "#FFC8E0");
  g.addColorStop(1, "#FF4FA3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 900);

  ctx.fillStyle = "#2d1520";
  ctx.font = "600 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("GLOSS", 300, 110);
  ctx.font = "400 15px sans-serif";
  ctx.fillStyle = "#5a3048";
  ctx.fillText("tvoje diagnostika", 300, 142);

  ctx.fillStyle = "#FF4FA3";
  ctx.font = "700 100px Georgia, serif";
  ctx.fillText(String(score), 300, 330);
  ctx.fillStyle = "#2d1520";
  ctx.font = "500 13px sans-serif";
  ctx.fillText("GLOSS SCORE", 300, 362);

  ctx.font = "600 34px Georgia, serif";
  ctx.fillText(look.label, 300, 450);
  ctx.font = "400 20px sans-serif";
  ctx.fillStyle = "#5a3048";
  ctx.fillText(look.procedure, 300, 492);

  ctx.fillStyle = "rgba(255,79,163,.18)";
  ctx.beginPath();
  ctx.roundRect(170, 540, 260, 54, 27);
  ctx.fill();
  ctx.fillStyle = "#FF4FA3";
  ctx.font = "600 15px sans-serif";
  ctx.fillText(look.badge.toUpperCase(), 300, 574);

  ctx.fillStyle = "#5a3048";
  ctx.font = "400 13px sans-serif";
  ctx.fillText("gloss-atelier.cz", 300, 830);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `gloss-diagnostika-${look.id}.png`;
  a.click();
}

export function GlossDiagnostika({ onReserve }: Props) {
  const [answers, setAnswers] = useState<DiagnostikaAnswers>({
    focus: null,
    vibe: null,
    time: null,
  });
  const [step, setStep] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(0);

  const result = useMemo(() => resolveDiagnostika(answers), [answers]);
  const done = Boolean(result);
  const currentQ = diagnostikaQuestions[step];
  const previewViz: FocusId = answers.focus ?? "lash";

  const pick = useCallback((questionId: keyof DiagnostikaAnswers, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId as never }));
    if (step < diagnostikaQuestions.length - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const reset = () => {
    setAnswers({ focus: null, vibe: null, time: null });
    setStep(0);
    setScoreAnim(0);
  };

  useEffect(() => {
    if (!result) return;
    const target = result.score;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setScoreAnim(Math.min(target, Math.round((frame / 24) * target)));
      if (frame >= 24) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [result]);

  return (
    <section id="vyzkousej" className="gloss-playground gloss-lab gloss-diagnostika">
      <div className="sec-head gloss-lab-head">
        <div className="sec-eyebrow">Gloss Lab</div>
        <h2 className="sec-title">
          Tvůj <em className="shine">signature</em> look
        </h2>
        <p className="sec-note">
          3 otázky · animované zrcadlo · tvůj gloss rituál a score — bez fotek, bez AR.
        </p>
      </div>

      <div className="playground-grid gloss-lab-grid gloss-diag-grid">
        <div className="playground-mirror-wrap">
          <div className={`gloss-mirror gloss-diag-mirror${done ? " is-engaged" : ""}`}>
            <div className="gloss-mirror-rim" aria-hidden />
            <div className="gloss-mirror-glass gloss-diag-glass">
              <GlossMirrorViz viz={result?.viz ?? previewViz} active={done || Boolean(answers.focus)} />

              {!done && currentQ && (
                <div className="gloss-diag-overlay">
                  <p className="gloss-diag-step">
                    {step + 1} / {diagnostikaQuestions.length}
                  </p>
                  <h3 className="gloss-diag-q">{currentQ.title}</h3>
                  <p className="gloss-diag-sub">{currentQ.subtitle}</p>
                  <div className="gloss-diag-options" role="group" aria-label={currentQ.title}>
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`gloss-diag-opt${answers[currentQ.id] === opt.id ? " active" : ""}`}
                        onClick={() => pick(currentQ.id, opt.id)}
                      >
                        <span className="gloss-diag-opt-label">{opt.label}</span>
                        <span className="gloss-diag-opt-hint">{opt.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {done && result && (
                <div className="gloss-diag-result">
                  <p className="gloss-diag-result-tag">Tvůj gloss look</p>
                  <h3>{result.look.label}</h3>
                  <p>{result.look.procedure}</p>
                </div>
              )}

              {done && <div className="gloss-mirror-sweep" aria-hidden />}
            </div>

            <div className="gloss-mirror-score" aria-live="polite">
              <span className="gloss-mirror-score-val">{done ? scoreAnim : "—"}</span>
              <span className="gloss-mirror-score-lbl">gloss score</span>
            </div>
          </div>

          {done && result && (
            <div className="playground-badge">
              <span className="playground-badge-icon">♥</span>
              Odemčeno: <strong>{result.look.badge}</strong>
            </div>
          )}
        </div>

        <div className="playground-panel gloss-diag-panel">
          {!done && (
            <div className="gloss-diag-progress">
              {diagnostikaQuestions.map((q, i) => (
                <span
                  key={q.id}
                  className={`gloss-diag-dot${i < step ? " done" : ""}${i === step ? " active" : ""}`}
                />
              ))}
            </div>
          )}

          {done && result ? (
            <>
              <p className="playground-result-eyebrow">Tvůj gloss rituál</p>
              <h3 className="gloss-diag-result-title">{result.look.procedure}</h3>
              <p className="gloss-diag-meta">
                {result.duration} · {result.priceHint}
              </p>
              <ol className="gloss-ritual">
                {result.ritual.map((s, i) => (
                  <li key={s.label}>
                    <span className="gloss-ritual-num">{i + 1}</span>
                    <span>
                      <strong>{s.label}</strong>
                      <em>{s.detail}</em>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="gloss-diag-desc">{result.look.desc}</p>
              <div className="playground-actions">
                <button
                  type="button"
                  className="playground-btn solid"
                  onClick={() => onReserve(result.look.procedure)}
                >
                  Rezervovat rituál
                </button>
                <button
                  type="button"
                  className="playground-btn ghost"
                  onClick={() => downloadGlossCard(result.look, result.score)}
                >
                  Stáhnout kartu
                </button>
                <button type="button" className="playground-btn ghost" onClick={reset}>
                  Znovu
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="playground-step">Gloss diagnostika</p>
              <p className="gloss-diag-intro">
                Odpověz na 3 otázky ve zrcadle. Na konci uvidíš doporučenou proceduru, časový rituál
                a gloss score — vše bez fotek a bez kamery.
              </p>
              {step > 0 && (
                <button
                  type="button"
                  className="playground-btn ghost"
                  onClick={() => {
                    const key = diagnostikaQuestions[step]?.id;
                    if (key) setAnswers((prev) => ({ ...prev, [key]: null }));
                    setStep((s) => Math.max(0, s - 1));
                  }}
                >
                  ← Zpět
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
