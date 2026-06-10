import { ritualIngredients, type RitualIngredientId } from "@/lib/gloss-ritual";

export function buildMirrorLookPrompt(ids: RitualIngredientId[], procedure: string): string {
  const labels = ids
    .map((id) => ritualIngredients.find((r) => r.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  return [
    "Photorealistic beauty editorial photograph, as if reflected in a luxury salon mirror.",
    "GLOSS atelier aesthetic: soft rose-champagne lighting, creamy bokeh, high-end beauty campaign.",
    `Beauty focus: ${labels || "natural glow"}. Treatment context: ${procedure}.`,
    "Close-up portrait, flawless natural skin, professional salon finish, subtle glam.",
    "Must look like a real photograph — NOT illustration, NOT cartoon, NOT line art, NOT 3D render.",
    "No text, no logos, no watermarks, no mirror frame in image.",
    "Vertical portrait composition, serene confident expression.",
  ].join(" ");
}

export type MirrorLookResult =
  | { ok: true; imageDataUrl: string; provider: "gemini" }
  | { ok: false; error: string };
