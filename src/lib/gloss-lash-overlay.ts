import type { LashStyleId } from "@/lib/gloss-data";
import {
  LEFT_LASH_ANCHOR_LOWER,
  LEFT_LASH_ANCHOR_UPPER,
  LEFT_LASH_LINE,
  lm,
  lmPath,
  RIGHT_LASH_ANCHOR_LOWER,
  RIGHT_LASH_ANCHOR_UPPER,
  RIGHT_LASH_LINE,
  type NormalizedLandmark,
} from "@/lib/gloss-face-landmarks";

export async function preloadLashAssets(): Promise<void> {}

let _ofc: HTMLCanvasElement | null = null;
function getOfc(w: number, h: number): HTMLCanvasElement {
  if (!_ofc) _ofc = document.createElement("canvas");
  if (_ofc.width !== w || _ofc.height !== h) {
    _ofc.width = w;
    _ofc.height = h;
  }
  return _ofc;
}

function pointOn(pts: { x: number; y: number }[], t: number) {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0]!;
  let total = 0;
  const segs: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
    segs.push(total);
  }
  const tgt = t * total;
  for (let i = 1; i < segs.length; i++) {
    if (tgt <= segs[i]!) {
      const u = (tgt - segs[i - 1]!) / (segs[i]! - segs[i - 1]! || 1);
      const a = pts[i - 1]!;
      const b = pts[i]!;
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  return pts[pts.length - 1]!;
}

function renderEye(
  oCtx: CanvasRenderingContext2D,
  lashLine: { x: number; y: number }[],
  growDir: { x: number; y: number },
  eyeW: number,
  s: number,
  extension: boolean,
  style: LashStyleId,
) {
  const inner = lashLine[0]!;
  const outer = lashLine[lashLine.length - 1]!;

  // ── 1. Root smudge band — heavy dark filled shape along lid ──────────
  // This is the mascara / liner base. Blurred when composited → looks natural.
  const baseH = eyeW * (extension ? 0.14 : 0.09) * (0.8 + s * 0.4);

  oCtx.beginPath();
  // Lower edge: the lash line itself
  lashLine.forEach((p, i) => (i === 0 ? oCtx.moveTo(p.x, p.y) : oCtx.lineTo(p.x, p.y)));
  // Upper edge: offset outward along growth direction
  for (let i = lashLine.length - 1; i >= 0; i--) {
    const p = lashLine[i]!;
    // Profile: thicker in centre, tapers to corners
    const t = i / (lashLine.length - 1);
    const profile = 0.4 + 0.6 * Math.sin(t * Math.PI);
    oCtx.lineTo(p.x + growDir.x * baseH * profile, p.y + growDir.y * baseH * profile);
  }
  oCtx.closePath();
  oCtx.fillStyle = "rgb(4, 2, 5)";
  oCtx.fill();

  if (!extension) return;

  // ── 2. Extension fringe — soft tapered shapes beyond the root band ───
  // All drawn on the SAME offscreen → blurred together → no sharp edges.
  const fringeCount = style === "mega" ? 30 : style === "volume" ? 22 : 16;
  const fringeLen = eyeW * (style === "mega" ? 0.46 : style === "volume" ? 0.38 : 0.30) * (0.85 + s * 0.3);
  const rootBand = eyeW * 0.10; // where fringe roots sit (just above smudge)

  for (let i = 0; i < fringeCount; i++) {
    const t = i / (fringeCount - 1);
    const base = pointOn(lashLine, t);

    // Profile: longer in centre-outer third, shorter at corners
    const profile = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.9 + 0.15);
    const lenVar = fringeLen * profile * (0.82 + Math.sin(i * 3.7 + 0.9) * 0.14);

    // Splay: lashes fan slightly outward toward outer corner
    const splayT = t - 0.5;
    const tangent = { x: outer.x - inner.x, y: outer.y - inner.y };
    const tlen = Math.hypot(tangent.x, tangent.y) || 1;
    const tx = tangent.x / tlen;
    const ty = tangent.y / tlen;
    let gx = growDir.x + tx * splayT * 0.28;
    let gy = growDir.y + ty * splayT * 0.28;
    const glen = Math.hypot(gx, gy) || 1;
    gx /= glen;
    gy /= glen;

    // Root sits at top of smudge band
    const rx = base.x + growDir.x * rootBand * profile;
    const ry = base.y + growDir.y * rootBand * profile;

    // Tip with natural curl (arc toward viewer)
    const curlAmount = 0.3 + profile * 0.45;
    const tipX = rx + gx * lenVar;
    const tipY = ry + gy * lenVar;
    const cpX = rx + gx * lenVar * 0.5;
    const cpY = ry + gy * lenVar * (0.5 + curlAmount * 0.4);

    // Width: wide at root, tapers to 0 at tip
    const hw = (style === "mega" ? 1.6 : style === "volume" ? 1.3 : 1.0) * (eyeW * 0.010) * profile;

    // Draw as tapered filled shape (not a stroke line)
    const px = -gy;
    const py = gx;
    oCtx.beginPath();
    oCtx.moveTo(rx + px * hw, ry + py * hw);
    oCtx.quadraticCurveTo(cpX + px * hw * 0.3, cpY + py * hw * 0.3, tipX, tipY);
    oCtx.quadraticCurveTo(cpX - px * hw * 0.3, cpY - py * hw * 0.3, rx - px * hw, ry - py * hw);
    oCtx.closePath();

    // Volume/mega: cluster of thinner lashes per position
    const clusterOpacity = style === "mega" ? 0.88 : style === "volume" ? 0.82 : 0.92;
    oCtx.fillStyle = `rgba(5, 2, 6, ${clusterOpacity * (0.75 + s * 0.25)})`;
    oCtx.fill();

    // Volume/mega: draw 1-2 side strands for fan effect
    if (style !== "classic" && profile > 0.3) {
      for (const ang of style === "mega" ? [-0.18, 0.18] : [-0.12]) {
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        const fgx = gx * cos - gy * sin;
        const fgy = gx * sin + gy * cos;
        const fl = lenVar * 0.82;
        const fpx = -fgy;
        const fpy = fgx;
        const fhw = hw * 0.65;
        oCtx.beginPath();
        oCtx.moveTo(rx + fpx * fhw, ry + fpy * fhw);
        oCtx.quadraticCurveTo(rx + fgx * fl * 0.5, ry + fgy * fl * 0.5, rx + fgx * fl, ry + fgy * fl);
        oCtx.quadraticCurveTo(rx - fpx * fhw * 0.3, ry - fpy * fhw * 0.3, rx - fpx * fhw, ry - fpy * fhw);
        oCtx.closePath();
        oCtx.fillStyle = `rgba(5, 2, 6, ${0.65 * (0.75 + s * 0.25)})`;
        oCtx.fill();
      }
    }
  }
}

function drawEyeLashes(
  ctx: CanvasRenderingContext2D,
  lashLine: { x: number; y: number }[],
  upper: { x: number; y: number },
  lower: { x: number; y: number },
  extension: boolean,
  s: number,
  style: LashStyleId,
) {
  const inner = lashLine[0]!;
  const outer = lashLine[lashLine.length - 1]!;
  const eyeW = Math.hypot(outer.x - inner.x, outer.y - inner.y);
  if (eyeW < 5) return;

  // Growth direction: away from lower lid anchor, toward upper
  const rawGx = upper.x - lower.x;
  const rawGy = upper.y - lower.y;
  const rawGlen = Math.hypot(rawGx, rawGy) || 1;
  const growDir = { x: rawGx / rawGlen, y: rawGy / rawGlen };

  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const ofc = getOfc(cw, ch);
  const oCtx = ofc.getContext("2d")!;
  oCtx.clearRect(0, 0, cw, ch);

  renderEye(oCtx, lashLine, growDir, eyeW, s, extension, style);

  // Single blur pass on the whole offscreen — unifies everything, kills sharp edges
  // 1.8-2.5px at typical face size = soft hair-like edges, not painted lines
  const blurPx = Math.max(0.8, eyeW * 0.018);
  ctx.save();
  ctx.filter = `blur(${blurPx}px)`;
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.88 + s * 0.1;
  ctx.drawImage(ofc, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

export async function drawLashOverlays(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  extension: boolean,
  style: LashStyleId,
  intensity: number,
): Promise<void> {
  const s = Math.max(0.5, Math.min(1, intensity / 100));

  for (const side of [
    {
      line: lmPath(landmarks, LEFT_LASH_LINE, w, h),
      upper: lm(landmarks, LEFT_LASH_ANCHOR_UPPER, w, h),
      lower: lm(landmarks, LEFT_LASH_ANCHOR_LOWER, w, h),
    },
    {
      line: lmPath(landmarks, RIGHT_LASH_LINE, w, h),
      upper: lm(landmarks, RIGHT_LASH_ANCHOR_UPPER, w, h),
      lower: lm(landmarks, RIGHT_LASH_ANCHOR_LOWER, w, h),
    },
  ]) {
    drawEyeLashes(ctx, side.line, side.upper, side.lower, extension, s, style);
  }
}
