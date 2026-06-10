export function ContourMarquee() {
  const line = (
    <span className="contour-marquee-text">
      Perfection is our business <i className="contour-marquee-star">✦</i> Confidence is our mission{" "}
      <i className="contour-marquee-star">✦</i> Perfection is our business{" "}
      <i className="contour-marquee-star">✦</i> Confidence is our mission{" "}
      <i className="contour-marquee-star">✦</i>
    </span>
  );

  return (
    <div className="contour-marquee" aria-hidden>
      <div className="contour-marquee-track">
        {line}
        {line}
      </div>
    </div>
  );
}
