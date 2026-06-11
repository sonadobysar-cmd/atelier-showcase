"use client";

import { useMemo } from "react";
import { resolveMirrorScene, type RitualIngredientId } from "@/lib/gloss-ritual";

type Props = {
  picked: RitualIngredientId[];
  phase: "compose" | "fog" | "revealed";
};

export function GlossMirrorGlow({ picked, phase }: Props) {
  const scene = useMemo(() => resolveMirrorScene(picked), [picked]);
  const showPhoto = phase === "fog" || phase === "revealed";
  const warm = picked.includes("glow") || picked.includes("laminate");

  return (
    <div
      className={`gloss-mirror-glow gloss-ritual-glow${picked.length ? " has-picks" : ""}${phase === "revealed" ? " is-clear" : ""}${showPhoto ? " is-live" : ""}`}
    >
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={scene.src}
          alt=""
          className={`gloss-mirror-scene${warm ? " is-warm" : ""}`}
          style={{ objectPosition: scene.objectPosition }}
          draggable={false}
        />
      )}
      {showPhoto && <div className="gloss-mirror-glow-sheen" aria-hidden />}
      {showPhoto && phase === "revealed" && <div className="gloss-mirror-glow-edge" aria-hidden />}
    </div>
  );
}
