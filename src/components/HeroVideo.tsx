"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  /** Finální hero video (kvalitní). */
  mp4Src?: string;
  webmSrc?: string;
  posterSrc?: string;
  /** Pokud je zdroj zpomalený záznam, lze mírně zrychlit (1 = normální). */
  playbackRate?: number;
  className?: string;
  overlayClassName?: string;
};

export function HeroVideo({
  mp4Src = "/videos/eliza-clinic/hero.mp4",
  webmSrc,
  posterSrc,
  playbackRate = 1,
  className = "",
  overlayClassName = "bg-black/35",
}: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const onCanPlay = () => {
      v.playbackRate = playbackRate;
      setReady(true);
      void v.play().catch(() => setFailed(true));
    };

    v.addEventListener("canplay", onCanPlay);
    return () => v.removeEventListener("canplay", onCanPlay);
  }, [playbackRate]);

  if (failed) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={ref}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: "translateZ(0)" }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterSrc}
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        <source src={mp4Src} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlayClassName}`} aria-hidden />
    </div>
  );
}
