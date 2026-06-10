"use client";

import { useMemo } from "react";
import { resolveMirrorScene, type RitualIngredientId } from "@/lib/gloss-ritual";

type Props = {
  picked: RitualIngredientId[];
  phase: "compose" | "fog" | "revealed";
  generatedSrc: string | null;
  generating: boolean;
};

export function GlossMirrorGlow({ picked, phase, generatedSrc, generating }: Props) {
  const fallback = useMemo(() => resolveMirrorScene(picked), [picked]);
  const src = generatedSrc ?? fallback.src;
  const objectPosition = generatedSrc ? "center 22%" : fallback.objectPosition;
  const warm = picked.includes("glow") || picked.includes("laminate");
  const vivid = Boolean(generatedSrc) || phase === "revealed" || phase === "fog";

  return (
    <div
      className={`gloss-mirror-glow${picked.length ? " has-picks" : ""}${vivid ? " is-vivid" : ""}${phase === "revealed" ? " is-clear" : ""}${generatedSrc ? " is-ai" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`gloss-mirror-scene${warm ? " is-warm" : ""}`}
        style={{ objectPosition }}
        draggable={false}
      />
      <div className="gloss-mirror-scene-ghost" aria-hidden />
      <div className="gloss-mirror-glow-depth" />
      <div className={`gloss-mirror-glow-warm${warm ? " on" : ""}`} />
      <div className="gloss-mirror-glow-ceiling" />
      <div className="gloss-mirror-glow-sheen" />
      <div className="gloss-mirror-glow-edge" />

      {generating && (
        <div className="gloss-mirror-generating" aria-live="polite">
          <div className="gloss-mirror-generating-shimmer" aria-hidden />
          <p>Generuji tvůj gloss look…</p>
        </div>
      )}
    </div>
  );
}
