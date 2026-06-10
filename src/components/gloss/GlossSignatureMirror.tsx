"use client";

import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildGlossEffectConfig,
  type BrowToneId,
  type FullGlamLashMode,
  type GlossLook,
  type LashLengthId,
  type LashStyleId,
} from "@/lib/gloss-data";
import type { AiEnhanceResult } from "@/lib/gloss-ai-enhance";
import {
  detectFaceLandmarks,
  getSourcePixelSize,
  initFaceLandmarker,
  renderGlossMirrorFrame,
} from "@/lib/gloss-face-engine";
import { localAiEnhance } from "@/lib/gloss-local-enhance";
import { GLOSS_FILTER_DEFS, applyGlossFilter, type GlossFilterId } from "@/lib/gloss-filters";
import { GlossFilterStrip } from "@/components/gloss/GlossFilterStrip";

type SourceMode = "idle" | "camera" | "photo";

type Props = {
  look: GlossLook;
  intensity: number;
  lashStyle: LashStyleId;
  lashLength: LashLengthId;
  fullGlamLash: FullGlamLashMode;
  browTone: BrowToneId;
  glossScore: number;
  played: boolean;
  onEngage: () => void;
  onCapture?: () => void;
};

export function GlossSignatureMirror({
  look,
  intensity,
  lashStyle,
  lashLength,
  fullGlamLash,
  browTone,
  glossScore,
  played,
  onEngage,
  onCapture,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const landmarksRef = useRef<ReturnType<typeof detectFaceLandmarks>>(null);

  const [mode, setMode] = useState<SourceMode>("idle");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [faceFound, setFaceFound] = useState(false);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedMirror, setEnhancedMirror] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<GlossFilterId | null>(null);
  const [filterUrl, setFilterUrl] = useState<string | null>(null);
  const [filterThumb, setFilterThumb] = useState<HTMLCanvasElement | null>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);

  const isLive = mode === "camera" || mode === "photo";
  const showLiveCanvas = isLive && !enhancedUrl;

  const effects = useMemo(
    () => buildGlossEffectConfig(look.id, intensity, lashStyle, lashLength, fullGlamLash, browTone),
    [look.id, intensity, lashStyle, lashLength, fullGlamLash, browTone],
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const ensureDetector = useCallback(async () => {
    if (detectorRef.current) return detectorRef.current;
    setModelLoading(true);
    try {
      detectorRef.current = await initFaceLandmarker();
      return detectorRef.current;
    } finally {
      setModelLoading(false);
    }
  }, []);

  const renderLoop = useCallback(async () => {
    const canvas = previewRef.current;
    if (!canvas || mode === "idle" || enhancedUrl) return;

    const source = mode === "camera" ? videoRef.current : photoRef.current;
    if (!source) return;

    if (mode === "camera" && (source as HTMLVideoElement).readyState < 2) {
      rafRef.current = requestAnimationFrame(() => void renderLoop());
      return;
    }

    const size = getSourcePixelSize(source);
    if (!size) {
      if (mode === "camera") {
        rafRef.current = requestAnimationFrame(() => void renderLoop());
      }
      return;
    }
    const { w, h } = size;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    try {
      const detector = await ensureDetector();
      const ts = mode === "camera" ? performance.now() : 0;
      landmarksRef.current = detectFaceLandmarks(detector, source, ts, mode === "camera");
      const found = await renderGlossMirrorFrame(
        ctx,
        source,
        landmarksRef.current,
        w,
        h,
        mode === "camera",
        effects,
      );
      setFaceFound(found);
      setFaceError(found ? null : "Natoč obličej do zrcadla — efekt se chytí na tvář.");
    } catch {
      setFaceError("Načítám rozpoznání obličeje…");
    }

    if (mode === "camera") {
      rafRef.current = requestAnimationFrame(() => void renderLoop());
    }
  }, [effects, ensureDetector, enhancedUrl, mode]);

  useEffect(() => {
    if (!isLive || enhancedUrl) return;
    cancelAnimationFrame(rafRef.current);
    void renderLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [enhancedUrl, isLive, renderLoop, look.id, intensity, lashStyle, lashLength, fullGlamLash]);

  useEffect(() => {
    if (mode === "photo" && photoRef.current?.complete) {
      void renderLoop();
    }
  }, [mode, photoUrl, renderLoop]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    onEngage();
    try {
      await ensureDetector();
      stopCamera();
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
        setPhotoUrl(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setMode("camera");
    } catch {
      setCameraError("Kamera není dostupná — zkus nahrát fotku.");
      setMode("idle");
    }
  }, [ensureDetector, onEngage, photoUrl, stopCamera]);

  const handlePhoto = useCallback(
    async (file: File) => {
      onEngage();
      await ensureDetector();
      stopCamera();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setMode("photo");
      setCameraError(null);
    },
    [ensureDetector, onEngage, photoUrl, stopCamera],
  );

  const snapshotSource = useCallback((): HTMLCanvasElement | null => {
    const source = mode === "camera" ? videoRef.current : photoRef.current;
    if (!source) return null;
    const sw =
      source instanceof HTMLVideoElement
        ? source.videoWidth || 720
        : source.naturalWidth || 720;
    const sh =
      source instanceof HTMLVideoElement
        ? source.videoHeight || 900
        : source.naturalHeight || 900;
    const snap = document.createElement("canvas");
    snap.width = sw;
    snap.height = sh;
    const ctx = snap.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, sw, sh);
    return snap;
  }, [mode]);

  // Build thumbnail once when face is first detected
  const buildFilterThumb = useCallback(() => {
    const source = mode === "camera" ? videoRef.current : photoRef.current;
    if (!source) return;
    const size = getSourcePixelSize(source);
    if (!size) return;
    const thumb = document.createElement("canvas");
    thumb.width = 72;
    thumb.height = 90;
    const ctx = thumb.getContext("2d");
    if (!ctx) return;
    // Letterbox/fill into thumbnail
    const { w, h } = size;
    const scale = Math.max(72 / w, 90 / h);
    const dw = w * scale;
    const dh = h * scale;
    if (mode === "camera") {
      ctx.translate(72, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, (72 - dw) / 2, (90 - dh) / 2, dw, dh);
    setFilterThumb(thumb);
  }, [mode]);

  const applyFilter = useCallback(
    async (filterId: GlossFilterId | null) => {
      setActiveFilter(filterId);
      if (filterId === null) {
        setFilterUrl(null);
        return;
      }
      const source = mode === "camera" ? videoRef.current : photoRef.current;
      if (!source) return;
      const size = getSourcePixelSize(source);
      if (!size) return;
      const { w, h } = size;

      const fc = filterCanvasRef.current;
      if (!fc) return;
      fc.width = w;
      fc.height = h;
      const ctx = fc.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      await applyGlossFilter(ctx, source, w, h, filterId, landmarksRef.current, mode === "camera");
      setFilterUrl(fc.toDataURL("image/jpeg", 0.92));
    },
    [mode],
  );

  // Rebuild thumb when face is first found
  useEffect(() => {
    if (faceFound && !filterThumb) buildFilterThumb();
  }, [faceFound, filterThumb, buildFilterThumb]);

  const generateAiLook = useCallback(async () => {
    const snap = snapshotSource();
    if (!snap) return;

    setAiProcessing(true);
    setAiNote(null);
    const dataUrl = snap.toDataURL("image/jpeg", 0.92);

    try {
      const res = await fetch("/api/gloss/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, lookLabel: look.label, config: effects }),
      });
      const data = (await res.json()) as AiEnhanceResult;

      setEnhancedMirror(mode === "camera");

      if (data.ok) {
        setEnhancedUrl(data.imageDataUrl);
        setAiNote(data.provider === "gemini" ? "AI gloss look · Gemini" : "AI gloss look");
      } else {
        const detector = await ensureDetector();
        const lm = detectFaceLandmarks(detector, snap, 0, false);
        if (!lm) {
          setAiNote("Obličej nenalezen — zkus jiný záběr.");
          return;
        }
        setEnhancedUrl(await localAiEnhance(snap, lm, effects));
        setAiNote("Lokální AI náhled (pro plnou AI nastav GEMINI_API_KEY)");
      }

      stopCamera();
      setMode("photo");
      setFlashing(true);
      setCaptured(true);
      onCapture?.();
      window.setTimeout(() => setFlashing(false), 420);
    } catch {
      setAiNote("Nepodařilo se vygenerovat look.");
    } finally {
      setAiProcessing(false);
    }
  }, [effects, ensureDetector, look.label, onCapture, snapshotSource, stopCamera]);

  const downloadEnhanced = useCallback(() => {
    if (!enhancedUrl) return;
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = `gloss-ai-${look.id}.jpg`;
    a.click();
  }, [enhancedUrl, look.id]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopCamera();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl, stopCamera]);

  return (
    <div className="gloss-mirror-stage">
      <div
        className={`gloss-mirror${isLive ? " is-live" : ""}${played ? " is-engaged" : ""}${flashing ? " is-flash" : ""}${faceFound ? " has-face" : ""}`}
        style={{ "--mirror-intensity": intensity } as React.CSSProperties}
      >
        <div className="gloss-mirror-rim" aria-hidden />
        <div className="gloss-mirror-glass">
          {mode === "idle" && (
            <div className="gloss-mirror-idle">
              <span className="gloss-mirror-idle-icon" aria-hidden>
                ✦
              </span>
              <p>Tvoje gloss zrcadlo</p>
              <span className="gloss-mirror-idle-hint">Živý náhled + AI gloss look po zachycení</span>
            </div>
          )}

          <video
            ref={videoRef}
            className="gloss-mirror-feed is-camera"
            playsInline
            muted
            autoPlay
            aria-hidden={mode !== "camera"}
            style={{ display: mode === "camera" ? "block" : "none" }}
          />

          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={photoRef}
              src={photoUrl}
              alt=""
              className="gloss-mirror-feed is-photo"
              aria-hidden={mode !== "photo"}
              style={{ display: mode === "photo" ? "block" : "none" }}
              onLoad={() => void renderLoop()}
            />
          )}

          {enhancedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={enhancedUrl}
              alt="AI gloss look"
              className={`gloss-mirror-preview gloss-mirror-ai-result${enhancedMirror ? " is-mirrored" : ""}`}
            />
          )}

          {showLiveCanvas && !filterUrl && (
            <canvas ref={previewRef} className="gloss-mirror-preview" aria-label="Živý náhled looku" />
          )}

          {filterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={filterUrl}
              alt="Filtr"
              className="gloss-mirror-preview gloss-filter-result"
            />
          )}

          {!faceFound && isLive && faceError && (
            <div className="gloss-mirror-face-hint">{faceError}</div>
          )}

          {modelLoading && showLiveCanvas && (
            <div className="gloss-mirror-face-hint gloss-mirror-loading">Načítám zrcadlo…</div>
          )}

          {aiProcessing && (
            <div className="gloss-mirror-face-hint gloss-mirror-loading">AI upravuje tvůj look…</div>
          )}

          {isLive && faceFound && <div className="gloss-mirror-sweep" aria-hidden />}
        </div>

        <div className="gloss-mirror-score" aria-live="polite">
          <span className="gloss-mirror-score-val">{glossScore}</span>
          <span className="gloss-mirror-score-lbl">gloss score</span>
        </div>

        {captured && (
          <div className="gloss-mirror-captured" aria-hidden>
            Zachyceno
          </div>
        )}
      </div>

      <div className="gloss-mirror-controls">
        <button
          type="button"
          className={`gloss-mirror-tab${mode === "camera" ? " active" : ""}`}
          onClick={() => void startCamera()}
        >
          <span className="gloss-mirror-tab-icon" aria-hidden>
            ◉
          </span>
          Živá kamera
        </button>
        <button
          type="button"
          className={`gloss-mirror-tab${mode === "photo" ? " active" : ""}`}
          onClick={() => fileRef.current?.click()}
        >
          <span className="gloss-mirror-tab-icon" aria-hidden>
            ↑
          </span>
          Nahrát fotku
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="gloss-mirror-file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handlePhoto(f);
            e.target.value = "";
          }}
        />
      </div>

      {isLive && faceFound && (
        <GlossFilterStrip
          filters={GLOSS_FILTER_DEFS}
          activeId={activeFilter}
          thumbSrc={filterThumb}
          onSelect={(id) => void applyFilter(id)}
        />
      )}

      {isLive && (
        <div className="gloss-mirror-actions">
          {!enhancedUrl ? (
            <button
              type="button"
              className="gloss-mirror-btn primary"
              onClick={() => void generateAiLook()}
              disabled={!faceFound || aiProcessing}
            >
              {aiProcessing ? "AI pracuje…" : "Generovat AI gloss look"}
            </button>
          ) : (
            <button type="button" className="gloss-mirror-btn primary" onClick={downloadEnhanced}>
              Stáhnout AI look
            </button>
          )}
          <button
            type="button"
            className="gloss-mirror-btn ghost"
            onClick={() => {
              stopCamera();
              if (photoUrl) URL.revokeObjectURL(photoUrl);
              setPhotoUrl(null);
              setEnhancedUrl(null);
              setAiNote(null);
              setMode("idle");
              setFaceFound(false);
            }}
          >
            Zavřít zrcadlo
          </button>
        </div>
      )}

      {aiNote && <p className="gloss-mirror-ai-note">{aiNote}</p>}
      {cameraError && <p className="gloss-mirror-error">{cameraError}</p>}
      <p className="gloss-mirror-privacy">
        Živý náhled lokálně · AI look při generování (volitelně Gemini API).
      </p>

      <canvas ref={captureRef} className="gloss-mirror-canvas" aria-hidden />
      <canvas ref={filterCanvasRef} className="gloss-mirror-canvas" aria-hidden />
    </div>
  );
}
