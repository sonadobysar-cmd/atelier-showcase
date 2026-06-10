import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
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
} from "@/lib/gloss-face-landmarks";
import { drawLashOverlays } from "@/lib/gloss-lash-overlay";

export type GlossFilterId = "lash-lift" | "extensions" | "skin" | "brows" | "full";

export type GlossFilterDef = {
  id: GlossFilterId;
  label: string;
  sub: string;
  /** CSS filter for thumbnail preview on <img>/<video> */
  cssPreview: string;
  /** Accent gradient for the filter chip */
  gradient: string;
  icon: string;
};

export const GLOSS_FILTER_DEFS: GlossFilterDef[] = [
  {
    id: "lash-lift",
    label: "Lash Lift",
    sub: "Zakřivené řasy",
    cssPreview: "contrast(1.12) brightness(0.98) saturate(1.06)",
    gradient: "linear-gradient(135deg,#2a1a3a 0%,#4a2060 100%)",
    icon: "✦",
  },
  {
    id: "extensions",
    label: "Extensions",
    sub: "Dramatické řasy",
    cssPreview: "contrast(1.22) brightness(0.94) saturate(1.04)",
    gradient: "linear-gradient(135deg,#0d0d1a 0%,#1a1030 100%)",
    icon: "◆",
  },
  {
    id: "skin",
    label: "Pleť",
    sub: "Záře & hladkost",
    cssPreview: "contrast(0.94) brightness(1.09) saturate(1.14)",
    gradient: "linear-gradient(135deg,#f9c6d8 0%,#ff8fc4 100%)",
    icon: "◉",
  },
  {
    id: "brows",
    label: "Brow Bar",
    sub: "Definice & tvar",
    cssPreview: "contrast(1.14) brightness(0.97) saturate(0.95)",
    gradient: "linear-gradient(135deg,#3a2010 0%,#6a4020 100%)",
    icon: "▬",
  },
  {
    id: "full",
    label: "Gloss Full",
    sub: "Celý look",
    cssPreview: "contrast(1.16) brightness(1.02) saturate(1.1)",
    gradient: "linear-gradient(135deg,#e5197e 0%,#ff8fc4 50%,#e8b84b 100%)",
    icon: "★",
  },
];

// ─── Canvas rendering per filter ──────────────────────────────────────────────

type Ctx = CanvasRenderingContext2D;

function drawSmoothPath(ctx: Ctx, pts: { x: number; y: number }[], close = false) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]!;
    const c = pts[i]!;
    ctx.quadraticCurveTo(p.x, p.y, (p.x + c.x) / 2, (p.y + c.y) / 2);
  }
  if (close) ctx.closePath();
  else {
    const l = pts[pts.length - 1]!;
    ctx.lineTo(l.x, l.y);
  }
}

function vignette(ctx: Ctx, w: number, h: number, strength: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function colorOverlay(
  ctx: Ctx,
  w: number,
  h: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
  mode: GlobalCompositeOperation,
) {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Lash smudge ───────────────────────────────────────────────────────────────

let _lashSmudgeOfc: HTMLCanvasElement | null = null;

function lashSmudge(
  ctx: Ctx,
  lashLine: { x: number; y: number }[],
  growDir: { x: number; y: number },
  eyeW: number,
  bandFraction: number, // 0.09 lift, 0.18 extensions
  opacity: number,
) {
  if (!_lashSmudgeOfc) _lashSmudgeOfc = document.createElement("canvas");
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  if (_lashSmudgeOfc.width !== cw || _lashSmudgeOfc.height !== ch) {
    _lashSmudgeOfc.width = cw;
    _lashSmudgeOfc.height = ch;
  }
  const o = _lashSmudgeOfc.getContext("2d")!;
  o.clearRect(0, 0, cw, ch);

  const bandH = eyeW * bandFraction;
  o.beginPath();
  lashLine.forEach((p, i) => (i === 0 ? o.moveTo(p.x, p.y) : o.lineTo(p.x, p.y)));
  for (let i = lashLine.length - 1; i >= 0; i--) {
    const p = lashLine[i]!;
    const t = i / (lashLine.length - 1);
    const profile = 0.35 + 0.65 * Math.sin(t * Math.PI);
    o.lineTo(p.x + growDir.x * bandH * profile, p.y + growDir.y * bandH * profile);
  }
  o.closePath();
  o.fillStyle = "rgb(3, 1, 4)";
  o.fill();

  const blur = Math.max(0.8, eyeW * 0.016);
  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = opacity;
  ctx.drawImage(_lashSmudgeOfc, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

function applyLashEffect(
  ctx: Ctx,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  extension: boolean,
  style: "classic" | "volume" | "mega",
  intensity: number,
) {
  const sides = [
    { line: lmPath(landmarks, LEFT_LASH_LINE, w, h), upper: lm(landmarks, 159, w, h), lower: lm(landmarks, 145, w, h) },
    { line: lmPath(landmarks, RIGHT_LASH_LINE, w, h), upper: lm(landmarks, 386, w, h), lower: lm(landmarks, 374, w, h) },
  ];

  for (const { line, upper, lower } of sides) {
    if (line.length < 2) continue;
    const inner = line[0]!;
    const outer = line[line.length - 1]!;
    const eyeW = Math.hypot(outer.x - inner.x, outer.y - inner.y);
    if (eyeW < 5) continue;
    const rawGx = upper.x - lower.x;
    const rawGy = upper.y - lower.y;
    const gl = Math.hypot(rawGx, rawGy) || 1;
    const growDir = { x: rawGx / gl, y: rawGy / gl };
    lashSmudge(ctx, line, growDir, eyeW, extension ? 0.18 : 0.10, 0.82 + (intensity / 100) * 0.15);
  }

  if (extension) {
    void drawLashOverlays(ctx, landmarks, w, h, true, style, intensity);
  }
}

// ── Brow effect ───────────────────────────────────────────────────────────────

let _browOfc2: HTMLCanvasElement | null = null;

function applyBrowEffect(ctx: Ctx, landmarks: NormalizedLandmark[], w: number, h: number, intensity: number) {
  if (!_browOfc2) _browOfc2 = document.createElement("canvas");
  if (_browOfc2.width !== w || _browOfc2.height !== h) {
    _browOfc2.width = w;
    _browOfc2.height = h;
  }
  const o = _browOfc2.getContext("2d")!;
  o.clearRect(0, 0, w, h);

  for (const indices of [LEFT_BROW, RIGHT_BROW]) {
    const pts = lmPath(landmarks, indices, w, h);
    if (pts.length < 2) continue;
    const browW = Math.hypot(pts[pts.length - 1]!.x - pts[0]!.x, pts[pts.length - 1]!.y - pts[0]!.y) || 40;
    const halfH = Math.max(6, browW * 0.13);
    const cx2 = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy2 = pts.reduce((s, p) => s + p.y, 0) / pts.length;

    // Top edge (above brow line)
    const top = pts.map((p) => ({ x: p.x, y: p.y - halfH * 0.35 }));
    // Bottom edge (below)
    const bottom = [...pts].reverse().map((p) => ({ x: p.x, y: p.y + halfH * 0.6 }));

    o.save();
    drawSmoothPath(o, [...top, ...bottom], true);
    o.clip();
    const gr = o.createRadialGradient(cx2, cy2, 0, cx2, cy2, browW * 0.65);
    const a = 0.5 + (intensity / 100) * 0.4;
    gr.addColorStop(0, `rgba(48, 28, 14, ${a})`);
    gr.addColorStop(0.55, `rgba(48, 28, 14, ${a * 0.72})`);
    gr.addColorStop(1, "rgba(48,28,14,0)");
    o.fillStyle = gr;
    o.fillRect(0, 0, w, h);
    o.restore();
  }

  const blur = Math.max(1.5, (w / 720) * 5);
  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.88;
  ctx.drawImage(_browOfc2, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Skin glow ─────────────────────────────────────────────────────────────────

function applySkinGlow(ctx: Ctx, landmarks: NormalizedLandmark[], w: number, h: number, intensity: number) {
  const s = intensity / 100;
  const cheekL = lm(landmarks, LEFT_CHEEK, w, h);
  const cheekR = lm(landmarks, RIGHT_CHEEK, w, h);
  const faceW = Math.hypot(cheekR.x - cheekL.x, cheekR.y - cheekL.y);

  // Soft warm glow on cheeks + forehead
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const [cx, cy, r, a] of [
    [cheekL.x, cheekL.y, faceW * 0.16, (0.06 + s * 0.06) as number],
    [cheekR.x, cheekR.y, faceW * 0.16, (0.06 + s * 0.06) as number],
  ] as [number, number, number, number][]) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255, 210, 190, ${a})`);
    g.addColorStop(1, "rgba(255,200,180,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // Eye brightening
  for (const eyeIdx of [LEFT_EYE, RIGHT_EYE]) {
    const pts = lmPath(landmarks, eyeIdx, w, h);
    if (pts.length < 3) continue;
    const cx2 = pts.reduce((s2, p) => s2 + p.x, 0) / pts.length;
    const cy2 = pts.reduce((s2, p) => s2 + p.y, 0) / pts.length;
    ctx.save();
    drawSmoothPath(ctx, pts, true);
    ctx.clip();
    const eg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, faceW * 0.08);
    eg.addColorStop(0, `rgba(255,255,255,${0.08 + s * 0.06})`);
    eg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = eg;
    ctx.fillRect(cx2 - faceW * 0.1, cy2 - faceW * 0.1, faceW * 0.2, faceW * 0.2);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  // Lip sheen
  const lipPts = lmPath(landmarks, LIPS_OUTER, w, h);
  if (lipPts.length > 3) {
    const lcx = lipPts.reduce((s2, p) => s2 + p.x, 0) / lipPts.length;
    const lcy = lipPts.reduce((s2, p) => s2 + p.y, 0) / lipPts.length;
    ctx.save();
    drawSmoothPath(ctx, lipPts, true);
    ctx.clip();
    const lg = ctx.createRadialGradient(lcx, lcy - faceW * 0.01, 0, lcx, lcy, faceW * 0.07);
    lg.addColorStop(0, `rgba(255, 200, 200, ${0.12 + s * 0.1})`);
    lg.addColorStop(1, "rgba(255,180,180,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = lg;
    ctx.fillRect(lcx - faceW * 0.1, lcy - faceW * 0.06, faceW * 0.2, faceW * 0.12);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
}

// ─── Main filter render ────────────────────────────────────────────────────────

export async function applyGlossFilter(
  outCtx: Ctx,
  source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  w: number,
  h: number,
  filterId: GlossFilterId,
  landmarks: NormalizedLandmark[] | null,
  selfieMirror: boolean,
): Promise<void> {
  // 1. Draw source
  outCtx.save();
  if (selfieMirror) {
    outCtx.translate(w, 0);
    outCtx.scale(-1, 1);
  }
  outCtx.drawImage(source, 0, 0, w, h);
  outCtx.restore();

  const intensity = 85;

  // 2. Global color grade
  switch (filterId) {
    case "lash-lift":
      // Deep slight cool — makes whites look brighter, lashes darker
      colorOverlay(outCtx, w, h, 20, 10, 35, 0.07, "multiply");
      colorOverlay(outCtx, w, h, 255, 250, 245, 0.04, "screen");
      vignette(outCtx, w, h, 0.22);
      break;

    case "extensions":
      // Dramatic dark — high drama
      colorOverlay(outCtx, w, h, 15, 8, 28, 0.10, "multiply");
      vignette(outCtx, w, h, 0.38);
      break;

    case "skin":
      // Warm rosy glow
      colorOverlay(outCtx, w, h, 255, 215, 195, 0.07, "soft-light");
      colorOverlay(outCtx, w, h, 255, 240, 230, 0.05, "screen");
      break;

    case "brows":
      // Cool, defined
      colorOverlay(outCtx, w, h, 25, 18, 10, 0.06, "multiply");
      vignette(outCtx, w, h, 0.18);
      break;

    case "full":
      // Balanced glamour
      colorOverlay(outCtx, w, h, 255, 210, 190, 0.05, "soft-light");
      colorOverlay(outCtx, w, h, 20, 12, 30, 0.06, "multiply");
      vignette(outCtx, w, h, 0.25);
      break;
  }

  if (!landmarks || landmarks.length === 0) return;

  // 3. Face-specific effects
  switch (filterId) {
    case "lash-lift":
      applyLashEffect(outCtx, landmarks, w, h, false, "classic", intensity);
      break;

    case "extensions":
      applyLashEffect(outCtx, landmarks, w, h, true, "volume", intensity);
      break;

    case "skin":
      applySkinGlow(outCtx, landmarks, w, h, intensity);
      break;

    case "brows":
      applyBrowEffect(outCtx, landmarks, w, h, intensity);
      break;

    case "full":
      applyLashEffect(outCtx, landmarks, w, h, true, "classic", intensity);
      applyBrowEffect(outCtx, landmarks, w, h, intensity);
      applySkinGlow(outCtx, landmarks, w, h, intensity * 0.7);
      break;
  }
}
