/** MediaPipe Face Landmarker — selected indices */

export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
] as const;

export const LEFT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46] as const;
export const RIGHT_BROW = [336, 296, 334, 293, 300, 276, 283, 282, 295, 285] as const;

export const LEFT_UPPER_LID = [33, 246, 161, 160, 159, 158, 157, 173, 133] as const;
export const RIGHT_UPPER_LID = [362, 398, 384, 385, 386, 387, 388, 466, 263] as const;

/** Řasová linie — horní víčko (inner → outer), MediaPipe Face Mesh 468 */
export const LEFT_LASH_LINE = [33, 246, 161, 160, 159, 158, 157, 173, 133] as const;
export const RIGHT_LASH_LINE = [362, 398, 384, 385, 386, 387, 388, 466, 263] as const;

/** Kotvy pro směr řas (horní vs. spodní okraj oka) */
export const LEFT_LASH_ANCHOR_UPPER = 159;
export const LEFT_LASH_ANCHOR_LOWER = 145;
export const RIGHT_LASH_ANCHOR_UPPER = 386;
export const RIGHT_LASH_ANCHOR_LOWER = 374;

export const LEFT_LOWER_LID = [33, 7, 163, 144, 145, 153, 154, 155, 133] as const;
export const RIGHT_LOWER_LID = [362, 382, 381, 380, 374, 373, 390, 249, 263] as const;

export const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246] as const;
export const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398] as const;

export const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185] as const;

export const LEFT_CHEEK = 123;
export const RIGHT_CHEEK = 352;
export const FOREHEAD = 10;
export const NOSE_TIP = 1;

export type NormalizedLandmark = { x: number; y: number; z?: number };

export function lm(
  landmarks: NormalizedLandmark[],
  index: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const p = landmarks[index];
  if (!p) return { x: 0, y: 0 };
  return { x: p.x * w, y: p.y * h };
}

export function lmPath(
  landmarks: NormalizedLandmark[],
  indices: readonly number[],
  w: number,
  h: number,
): { x: number; y: number }[] {
  return indices.map((i) => lm(landmarks, i, w, h));
}
