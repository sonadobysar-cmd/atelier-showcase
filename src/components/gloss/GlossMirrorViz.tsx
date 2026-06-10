"use client";

import type { FocusId } from "@/lib/gloss-diagnostika";

type Props = {
  viz: FocusId;
  active: boolean;
};

export function GlossMirrorViz({ viz, active }: Props) {
  const showLash = viz === "lash" || viz === "all";
  const showBrow = viz === "brow" || viz === "all";
  const showSkin = viz === "skin" || viz === "all";

  return (
    <svg
      className={`gloss-viz-svg${active ? " is-active" : ""}`}
      viewBox="0 0 320 400"
      aria-hidden
    >
      <defs>
        <radialGradient id="glossVizGlow" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#FF8FC4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF4FA3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glossVizSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD1E6" />
          <stop offset="100%" stopColor="#E8A0B8" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="210" rx="118" ry="148" fill="url(#glossVizGlow)" className="gloss-viz-aura" />

      <ellipse cx="160" cy="200" rx="88" ry="108" fill="url(#glossVizSkin)" opacity="0.35" />

      {showSkin && (
        <g className="gloss-viz-skin">
          <ellipse cx="118" cy="218" rx="22" ry="14" fill="#fff" opacity="0.2" />
          <ellipse cx="202" cy="218" rx="22" ry="14" fill="#fff" opacity="0.2" />
          <ellipse cx="160" cy="178" rx="28" ry="16" fill="#fff" opacity="0.15" />
        </g>
      )}

      {showBrow && (
        <g className="gloss-viz-brow">
          <path d="M98 152 Q118 138 142 148" fill="none" stroke="#5a3048" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M178 148 Q202 138 222 152" fill="none" stroke="#5a3048" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      <ellipse cx="118" cy="188" rx="18" ry="11" fill="none" stroke="#5a3048" strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="202" cy="188" rx="18" ry="11" fill="none" stroke="#5a3048" strokeWidth="1.5" opacity="0.5" />

      {showLash && (
        <g className="gloss-viz-lash">
          {[-24, -12, 0, 12, 24].map((dx) => (
            <path
              key={`l-${dx}`}
              d={`M${118 + dx} 182 Q${118 + dx - 2} 168 ${118 + dx + 4} 158`}
              fill="none"
              stroke="#1a0a12"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
          {[-24, -12, 0, 12, 24].map((dx) => (
            <path
              key={`r-${dx}`}
              d={`M${202 + dx} 182 Q${202 + dx + 2} 168 ${202 + dx - 4} 158`}
              fill="none"
              stroke="#1a0a12"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      <path
        d="M160 228 Q150 248 160 262 Q170 248 160 228"
        fill="none"
        stroke="#c87898"
        strokeWidth="2"
        opacity="0.55"
      />

      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          className="gloss-viz-sparkle"
          cx={60 + i * 50}
          cy={80 + (i % 2) * 24}
          r="2"
          fill="#fff"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </svg>
  );
}
