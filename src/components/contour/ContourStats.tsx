const STATS = [
  { value: "100%", label: "Záruka spokojenosti" },
  { value: "01", label: "Zdravotnická klinika v Praze" },
  { value: "6", label: "Specializovaných oblastí" },
] as const;

export function ContourStats() {
  return (
    <div className="contour-stats" aria-label="Klíčové údaje">
      <div className="contour-wrap contour-stats-inner">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="contour-stat">
            <span className="contour-stat-value">{stat.value}</span>
            <span className="contour-stat-label">{stat.label}</span>
            {i < STATS.length - 1 && <span className="contour-stat-div" aria-hidden />}
          </div>
        ))}
      </div>
    </div>
  );
}
