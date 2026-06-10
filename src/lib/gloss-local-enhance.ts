import { applyGlossEffects, type GlossEffectConfig } from "@/lib/gloss-face-effects";
import type { NormalizedLandmark } from "@/lib/gloss-face-landmarks";

/** Silnější lokální verze efektů pro finální AI náhled bez API klíče */
export async function localAiEnhance(
  source: HTMLCanvasElement | HTMLImageElement,
  landmarks: NormalizedLandmark[],
  config: GlossEffectConfig,
): Promise<string> {
  const w = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
  const h = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, w, h);

  const boosted: GlossEffectConfig = {
    ...config,
    intensity: Math.min(100, config.intensity + 12),
  };

  await applyGlossEffects(ctx, canvas, source, landmarks, w, h, boosted);

  return canvas.toDataURL("image/jpeg", 0.92);
}
