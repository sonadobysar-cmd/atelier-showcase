import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { applyGlossEffects, type GlossEffectConfig } from "@/lib/gloss-face-effects";
import { preloadLashAssets } from "@/lib/gloss-lash-overlay";

let landmarker: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker> | null = null;
let runningMode: "VIDEO" | "IMAGE" = "VIDEO";

let workCanvas: HTMLCanvasElement | null = null;

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export function getSourcePixelSize(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
): { w: number; h: number } | null {
  if (source instanceof HTMLVideoElement) {
    const w = source.videoWidth;
    const h = source.videoHeight;
    return w > 0 && h > 0 ? { w, h } : null;
  }
  if (source instanceof HTMLImageElement) {
    const w = source.naturalWidth;
    const h = source.naturalHeight;
    return w > 0 && h > 0 ? { w, h } : null;
  }
  const w = source.width;
  const h = source.height;
  return w > 0 && h > 0 ? { w, h } : null;
}

function getWorkCanvas(w: number, h: number): HTMLCanvasElement {
  if (!workCanvas) workCanvas = document.createElement("canvas");
  if (workCanvas.width !== w || workCanvas.height !== h) {
    workCanvas.width = w;
    workCanvas.height = h;
  }
  return workCanvas;
}

export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
    landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    await preloadLashAssets();
    return landmarker;
  })();

  return initPromise;
}

export function detectFaceLandmarks(
  detector: FaceLandmarker,
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  timestampMs: number,
  isVideo: boolean,
): NormalizedLandmark[] | null {
  const needed = isVideo ? "VIDEO" : "IMAGE";
  if (runningMode !== needed) {
    detector.setOptions({ runningMode: needed });
    runningMode = needed;
  }

  if (isVideo) {
    const result = detector.detectForVideo(source, timestampMs);
    return result.faceLandmarks[0] ?? null;
  }
  const result = detector.detect(source);
  return result.faceLandmarks[0] ?? null;
}

/**
 * Efekty v nativním prostoru snímku (MediaPipe 468 landmarků, normalizované 0–1).
 * w/h musí odpovídat pixelům zdroje (videoWidth × videoHeight).
 * Zrcadlení selfie (scaleX(-1)) až při výstupu — stejně jako u .gloss-mirror-feed.is-camera.
 */
export async function renderGlossMirrorFrame(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement,
  landmarks: NormalizedLandmark[] | null,
  w: number,
  h: number,
  selfieMirror: boolean,
  effects: GlossEffectConfig,
): Promise<boolean> {
  const work = getWorkCanvas(w, h);
  const wctx = work.getContext("2d");
  if (!wctx) return false;

  wctx.setTransform(1, 0, 0, 1, 0, 0);
  wctx.clearRect(0, 0, w, h);
  wctx.drawImage(source, 0, 0, w, h);

  if (landmarks && landmarks.length > 0) {
    await applyGlossEffects(wctx, work, source, landmarks, w, h, effects);
  }

  // Do NOT reset the transform — caller sets DPR scale so we draw in logical coords.
  if (selfieMirror) {
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(work, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(work, 0, 0, w, h);
  }

  return Boolean(landmarks && landmarks.length > 0);
}

export type { NormalizedLandmark };
