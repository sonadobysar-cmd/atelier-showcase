"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#FF4FA3", "#E8B84B", "#FF8FC4", "#E5197E", "#FFFFFF"];

export function GlossEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = 0;
    let H = 0;
    let raf = 0;

    const parts = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.8 + 0.5,
      s: Math.random() * 0.4 + 0.1,
      a: Math.random(),
      ad: Math.random() * 0.02 + 0.005,
      c: COLORS[i % COLORS.length]!,
    }));

    const resize = () => {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
    };

    const animate = !matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      cx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.y -= p.s;
        p.a += p.ad;
        if (p.a > 1 || p.a < 0) p.ad *= -1;
        if (p.y < -5) {
          p.y = H + 5;
          p.x = Math.random() * W;
        }
        cx.globalAlpha = Math.max(0, Math.min(0.85, p.a));
        cx.fillStyle = p.c;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fill();
      });
      cx.globalAlpha = 1;
      if (animate) raf = requestAnimationFrame(tick);
    };

    resize();
    if (animate) tick();

    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="aurora" aria-hidden>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <canvas id="glitter" ref={canvasRef} aria-hidden />
    </>
  );
}
