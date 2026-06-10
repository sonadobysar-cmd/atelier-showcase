export function GlossLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`.trim()}>
      GL<b>O</b>SS<span className="spark">✦</span>
    </span>
  );
}
