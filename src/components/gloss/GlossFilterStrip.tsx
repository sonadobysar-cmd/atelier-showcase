"use client";

import { useEffect, useRef } from "react";
import type { GlossFilterDef, GlossFilterId } from "@/lib/gloss-filters";

type Props = {
  filters: GlossFilterDef[];
  activeId: GlossFilterId | null;
  thumbSrc: HTMLCanvasElement | null;
  onSelect: (id: GlossFilterId) => void;
};

function FilterThumb({
  filter,
  thumbSrc,
  active,
  onSelect,
}: {
  filter: GlossFilterDef;
  thumbSrc: HTMLCanvasElement | null;
  active: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !thumbSrc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Draw source into thumbnail with CSS filter applied via canvas
    ctx.filter = filter.cssPreview;
    ctx.drawImage(thumbSrc, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
  }, [thumbSrc, filter.cssPreview]);

  return (
    <button
      type="button"
      className={`gf-chip${active ? " active" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <div className="gf-thumb-wrap">
        {thumbSrc ? (
          <canvas ref={canvasRef} className="gf-thumb-canvas" width={72} height={90} />
        ) : (
          <div className="gf-thumb-placeholder" style={{ background: filter.gradient }}>
            <span>{filter.icon}</span>
          </div>
        )}
        {active && <div className="gf-active-ring" />}
      </div>
      <span className="gf-label">{filter.label}</span>
    </button>
  );
}

export function GlossFilterStrip({ filters, activeId, thumbSrc, onSelect }: Props) {
  return (
    <div className="gf-strip" role="group" aria-label="Filtry">
      <div className="gf-strip-inner">
        {/* "Original" chip */}
        <button
          type="button"
          className={`gf-chip${activeId === null ? " active" : ""}`}
          onClick={() => onSelect(null as unknown as GlossFilterId)}
          aria-pressed={activeId === null}
        >
          <div className="gf-thumb-wrap">
            {thumbSrc ? (
              <canvas
                className="gf-thumb-canvas"
                width={72}
                height={90}
                ref={(c) => {
                  if (!c || !thumbSrc) return;
                  const ctx = c.getContext("2d");
                  if (ctx) ctx.drawImage(thumbSrc, 0, 0, c.width, c.height);
                }}
              />
            ) : (
              <div className="gf-thumb-placeholder" style={{ background: "linear-gradient(135deg,#fff6fb,#ffd1e6)" }}>
                <span>◎</span>
              </div>
            )}
            {activeId === null && <div className="gf-active-ring" />}
          </div>
          <span className="gf-label">Originál</span>
        </button>

        {filters.map((f) => (
          <FilterThumb
            key={f.id}
            filter={f}
            thumbSrc={thumbSrc}
            active={activeId === f.id}
            onSelect={() => onSelect(f.id)}
          />
        ))}
      </div>
    </div>
  );
}
