import type { GlossEffectConfig } from "@/lib/gloss-face-effects";

export function buildAiEnhancePrompt(config: GlossEffectConfig, lookLabel: string): string {
  const parts: string[] = [
    "You are a professional beauty photo retoucher for a luxury lash and brow salon called GLOSS.",
    "Edit this portrait photo realistically. Keep the person's identity, face shape, and expression exactly the same.",
    "Do NOT add cartoon lines, stickers, or fake overlays. The result must look like a real professional salon photo.",
  ];

  if (config.skin) {
    parts.push("Apply subtle facial retouching: even skin tone, gentle glow, hydrated dewy finish, remove minor blemishes.");
  }
  if (config.brow) {
    const tone =
      config.browTone === "light"
        ? "light brown"
        : config.browTone === "dark"
          ? "dark brown"
          : "medium brown";
    parts.push(
      `Brow lamination: brush up the client's natural eyebrow hairs, add subtle ${tone} tint fading softly at edges, glossy laminated finish.`,
    );
  }
  if (config.lashLift) {
    parts.push("Lash lifting: curl and lift the client's natural lashes upward, darker and more defined, natural not dramatic.");
  }
  if (config.lashExtensions) {
    const style =
      config.lashStyle === "mega"
        ? "full mega volume"
        : config.lashStyle === "volume"
          ? "volume fan"
          : "classic";
    const len =
      config.lashLength === "dramatic"
        ? "14mm dramatic length"
        : config.lashLength === "natural"
          ? "10mm natural length"
          : "12mm medium length";
    parts.push(`Eyelash extensions: apply realistic ${style} lash extensions, ${len}, following the eye line naturally.`);
  }

  parts.push(`Procedure context: ${lookLabel}. Intensity: ${config.intensity}% (subtle to moderate, never overdone).`);
  parts.push("Output only the retouched portrait, photorealistic.");

  return parts.join(" ");
}

export type AiEnhanceResult =
  | { ok: true; imageDataUrl: string; provider: "gemini" | "local" }
  | { ok: false; error: string };
