function sparks(id: string) {
  const pts = [
    [40, 50],
    [260, 40],
    [210, 70],
    [60, 170],
    [270, 150],
    [150, 30],
    [110, 200],
    [230, 200],
  ];
  return pts
    .map(([x, y], k) => {
      const r = (k % 3) + 1.2;
      return `<path d="M${x} ${y - r * 3} L${x + r} ${y} L${x + r * 3} ${y} L${x + r} ${y} L${x} ${y + r * 3} L${x - r} ${y} L${x - r * 3} ${y} L${x - r} ${y} Z" fill="#fff" opacity="${0.5 + (k % 3) * 0.15}"/>`;
    })
    .join("");
}

function chromeArt(id: string, c1: string, c2: string, c3: string) {
  return `<svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
<radialGradient id="r${id}" cx="30%" cy="25%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".4" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<filter id="b${id}"><feGaussianBlur stdDeviation="14"/></filter></defs>
<rect width="300" height="230" fill="url(#g${id})"/>
<g filter="url(#b${id})" opacity=".75">
<ellipse cx="70" cy="60" rx="120" ry="70" fill="${c1}"/>
<ellipse cx="240" cy="180" rx="120" ry="80" fill="${c3}"/>
<ellipse cx="170" cy="110" rx="70" ry="50" fill="#ffffff" opacity=".5"/>
</g>
<path d="M0 150 Q90 100 160 140 T300 120 L300 230 L0 230 Z" fill="#ffffff" opacity=".18"/>
<path d="M0 90 Q120 150 300 70" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".5"/>
<rect width="300" height="230" fill="url(#r${id})"/>
${sparks(id)}
</svg>`;
}

const ART_MAP = {
  lash: () => chromeArt("L", "#FFE8F3", "#FF8FC4", "#E5197E"),
  brow: () => chromeArt("B", "#FFF0F6", "#FF6FB0", "#FF4FA3"),
  cosmo: () => chromeArt("C", "#FFFFFF", "#FFB8D9", "#FF8FC4"),
  ext: () => chromeArt("E", "#FFD1E6", "#FF5FAB", "#E5197E"),
} as const;

export function getGlossFieldArt(key: keyof typeof ART_MAP) {
  return ART_MAP[key]();
}

export const glossMapSvg = `<svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE8F3"/><stop offset="1" stop-color="#FFD1E6"/></linearGradient></defs><rect width="400" height="340" fill="url(#mp)"/><g stroke="#FF4FA3" stroke-width="2" opacity=".35" fill="none"><path d="M0 90 H400"/><path d="M0 200 H400"/><path d="M120 0 V340"/><path d="M280 0 V340"/></g><circle cx="200" cy="145" r="40" fill="#FF4FA3" opacity=".15"/><path d="M200 95 C175 95 158 115 158 140 C158 175 200 215 200 215 C200 215 242 175 242 140 C242 115 225 95 200 95 Z" fill="#FF4FA3"/><circle cx="200" cy="138" r="16" fill="#fff"/><text x="200" y="262" text-anchor="middle" font-family="Noto Serif Display,serif" font-weight="600" font-size="19" fill="#0A0A0A">Růžová 7</text></svg>`;
