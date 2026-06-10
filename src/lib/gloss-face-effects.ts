import type { BrowToneId, LashLengthId, LashStyleId } from "@/lib/gloss-data";
import {
  FACE_OVAL,
  FOREHEAD,
  LEFT_BROW,
  LEFT_CHEEK,
  LEFT_EYE,
  LEFT_LASH_LINE,
  LIPS_OUTER,
  lm,
  lmPath,
  RIGHT_BROW,
  RIGHT_CHEEK,
  RIGHT_EYE,
  RIGHT_LASH_LINE,
  type NormalizedLandmark,
} from "@/lib/gloss-face-landmarks";
import { drawLashOverlays } from "@/lib/gloss-lash-overlay";

export type GlossEffectConfig = {
  skin: boolean;
  brow: boolean;
  lashLift: boolean;
  lashExtensions: boolean;
  lashStyle: LashStyleId;
  lashLength: LashLengthId;
  browTone: BrowToneId;
  intensity: number;
};

const BROW_RGB: Record<BrowToneId, [number, number, number]> = {
  light: [184, 149, 120],
  medium: [139, 102, 73],
  dark: [90, 63, 48],
};

function strength(intensity: number): number {
  return Math.max(0.5, Math.min(1, intensity / 100));
}

function drawSmoothPath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  close = false,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) / 2, (prev.y + cur.y) / 2);
  }
  if (close) ctx.closePath();
  else {
    const last = points[points.length - 1]!;
    ctx.lineTo(last.x, last.y);
  }
}

function patchRegion(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  landmarks: NormalizedLandmark[],
  indices: readonly number[],
  w: number,
  h: number,
  pad = 1.08,
) {
  const pts = lmPath(landmarks, indices, w, h);
  if (pts.length < 3) return;
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const expanded = pts.map((p) => ({
    x: cx + (p.x - cx) * pad,
    y: cy + (p.y - cy) * pad,
  }));
  ctx.save();
  drawSmoothPath(ctx, expanded, true);
  ctx.clip();
  ctx.drawImage(source, 0, 0, w, h);
  ctx.restore();
}

function browMask(pts: { x: number; y: number }[], halfH: number): { x: number; y: number }[] {
  const top = pts.map((p) => ({ x: p.x, y: p.y - halfH * 0.3 }));
  const bottom = [...pts].reverse().map((p) => ({ x: p.x, y: p.y + halfH * 0.55 }));
  return [...top, ...bottom];
}

function lashBandMask(
  lid: { x: number; y: number }[],
  band: number,
): { x: number; y: number }[] {
  const outer = lid.map((p, i) => {
    const prev = lid[Math.max(0, i - 1)]!;
    const next = lid[Math.min(lid.length - 1, i + 1)]!;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return { x: p.x + nx * band * 0.3, y: p.y + ny * band * 0.3 - band };
  });
  const inner = [...lid].reverse().map((p) => ({ x: p.x, y: p.y + 1 }));
  return [...outer, ...inner];
}

function enhanceLashBand(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  lid: { x: number; y: number }[],
  w: number,
  h: number,
  s: number,
  extension: boolean,
) {
  const band = extension ? 18 + s * 14 : 13 + s * 9;
  const mask = lashBandMask(lid, band);

  // Pass 1: high contrast + dark — turns natural lashes pitch-black like mascara
  ctx.save();
  drawSmoothPath(ctx, mask, true);
  ctx.clip();
  ctx.filter = `contrast(${2.8 + s * 1.2}) brightness(${0.38 - s * 0.08}) saturate(0.6)`;
  ctx.globalAlpha = 0.62 + s * 0.28;
  ctx.drawImage(source, 0, 0, w, h);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.restore();

  // Pass 2: dark overlay makes the root eyeliner-dense
  ctx.save();
  const rootMask = lashBandMask(lid, band * 0.35);
  drawSmoothPath(ctx, rootMask, true);
  ctx.clip();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.45 + s * 0.35;
  ctx.fillStyle = "rgb(10, 5, 12)";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

let _browOfc: HTMLCanvasElement | null = null;
function getBrowOfc(w: number, h: number): HTMLCanvasElement {
  if (!_browOfc) _browOfc = document.createElement("canvas");
  if (_browOfc.width !== w || _browOfc.height !== h) {
    _browOfc.width = w;
    _browOfc.height = h;
  }
  return _browOfc;
}

export function applyBrowLamination(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  tone: BrowToneId,
  intensity: number,
) {
  const s = strength(intensity);
  const [r, g, b] = BROW_RGB[tone];

  const ofc = getBrowOfc(w, h);
  const oCtx = ofc.getContext("2d")!;
  oCtx.clearRect(0, 0, w, h);

  for (const indices of [LEFT_BROW, RIGHT_BROW] as const) {
    const pts = lmPath(landmarks, indices, w, h);
    if (pts.length < 2) continue;
    const browW =
      Math.hypot(
        pts[pts.length - 1]!.x - pts[0]!.x,
        pts[pts.length - 1]!.y - pts[0]!.y,
      ) || 40;
    const halfH = Math.max(6, browW * 0.13);
    const mask = browMask(pts, halfH);

    // Fill brow shape — dark, toned toward chosen colour
    // Drawn on offscreen canvas, then blurred when composited → looks like
    // real brow lamination (dense, defined, not individual strokes)
    oCtx.save();
    drawSmoothPath(oCtx, mask, true);
    oCtx.clip();

    // Gradient: darkest at brow centre line, fades at edges — mimics hair density
    const cx = pts.reduce((s2, p) => s2 + p.x, 0) / pts.length;
    const cy = pts.reduce((s2, p) => s2 + p.y, 0) / pts.length;
    const grad = oCtx.createRadialGradient(cx, cy, 0, cx, cy, browW * 0.65);
    const alpha = 0.55 + s * 0.38;
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.75})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    oCtx.fillStyle = grad;
    oCtx.fillRect(0, 0, w, h);
    oCtx.restore();
  }

  // Blur the whole brow layer together → no hard edges, looks like real hair density
  const browBlur = Math.max(1.5, (w / 720) * (3.5 + s * 2.5));
  ctx.save();
  ctx.filter = `blur(${browBlur}px)`;
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.9;
  ctx.drawImage(ofc, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();

  // Gloss highlight: screen blend — simulates lamination sheen at arch
  for (const indices of [LEFT_BROW, RIGHT_BROW] as const) {
    const pts = lmPath(landmarks, indices, w, h);
    if (pts.length < 2) continue;
    const browW =
      Math.hypot(
        pts[pts.length - 1]!.x - pts[0]!.x,
        pts[pts.length - 1]!.y - pts[0]!.y,
      ) || 40;
    const halfH = Math.max(6, browW * 0.13);
    const archPt = pts.reduce((best, p) => (p.y < best.y ? p : best), pts[0]!);
    const hlR = browW * 0.20;
    ctx.save();
    drawSmoothPath(ctx, browMask(pts, halfH * 0.5), true);
    ctx.clip();
    const hlGrad = ctx.createRadialGradient(archPt.x, archPt.y, 0, archPt.x, archPt.y + halfH * 0.15, hlR);
    hlGrad.addColorStop(0, `rgba(255, 253, 248, ${0.26 + s * 0.18})`);
    hlGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = hlGrad;
    ctx.fillRect(archPt.x - hlR, archPt.y - hlR, hlR * 2, hlR * 2);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
}

export function applySkinTreatment(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  intensity: number,
) {
  const s = strength(intensity);
  const oval = lmPath(landmarks, FACE_OVAL, w, h);
  const cheekL = lm(landmarks, LEFT_CHEEK, w, h);
  const cheekR = lm(landmarks, RIGHT_CHEEK, w, h);
  const forehead = lm(landmarks, FOREHEAD, w, h);
  const faceW = Math.hypot(cheekR.x - cheekL.x, cheekR.y - cheekL.y);

  ctx.save();
  drawSmoothPath(ctx, oval, true);
  ctx.clip();

  ctx.save();
  ctx.filter = `blur(${1 + s * 1.6}px)`;
  ctx.globalAlpha = 0.12 + s * 0.16;
  ctx.drawImage(source, 0, 0, w, h);
  ctx.restore();

  ctx.globalCompositeOperation = "soft-light";
  for (const [cx, cy, r, peak] of [
    [cheekL.x, cheekL.y, faceW * 0.08, 0.07],
    [cheekR.x, cheekR.y, faceW * 0.08, 0.07],
    [forehead.x, forehead.y - faceW * 0.03, faceW * 0.1, 0.05],
  ] as const) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,252,250,${peak * s})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  patchRegion(ctx, source, landmarks, LEFT_EYE, w, h, 1.1);
  patchRegion(ctx, source, landmarks, RIGHT_EYE, w, h, 1.1);
  patchRegion(ctx, source, landmarks, LIPS_OUTER, w, h, 1.05);
}

export async function applyLashEnhancement(
  ctx: CanvasRenderingContext2D,
  work: HTMLCanvasElement,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  extension: boolean,
  intensity: number,
  lashStyle: GlossEffectConfig["lashStyle"],
) {
  const s = strength(intensity);
  enhanceLashBand(ctx, work, lmPath(landmarks, LEFT_LASH_LINE, w, h), w, h, s, extension);
  enhanceLashBand(ctx, work, lmPath(landmarks, RIGHT_LASH_LINE, w, h), w, h, s, extension);
  await drawLashOverlays(ctx, landmarks, w, h, extension, lashStyle, intensity);
}

export async function applyGlossEffects(
  ctx: CanvasRenderingContext2D,
  work: HTMLCanvasElement,
  source: CanvasImageSource,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  config: GlossEffectConfig,
) {
  if (config.skin) {
    applySkinTreatment(ctx, source, landmarks, w, h, config.intensity);
  }
  if (config.brow) {
    applyBrowLamination(ctx, landmarks, w, h, config.browTone, config.intensity);
  }
  if (config.lashLift) {
    await applyLashEnhancement(ctx, work, landmarks, w, h, false, config.intensity, config.lashStyle);
  }
  if (config.lashExtensions) {
    const boost = config.lashLength === "dramatic" ? 1.15 : config.lashLength === "natural" ? 0.9 : 1;
    const styleBoost = config.lashStyle === "mega" ? 1.2 : config.lashStyle === "volume" ? 1.1 : 1;
    await applyLashEnhancement(
      ctx,
      work,
      landmarks,
      w,
      h,
      true,
      config.intensity * boost * styleBoost,
      config.lashStyle,
    );
  }
}
