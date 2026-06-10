"use client";

import { useState } from "react";
import { glossClientPhotos } from "@/lib/gloss-data";

export function GlossMirrors() {
  return (
    <div className="mirrors">
      {glossClientPhotos.map((photo, i) => (
        <WavyMirror key={photo.src} photo={photo} index={i} />
      ))}
    </div>
  );
}

function WavyMirror({
  photo,
  index,
}: {
  photo: (typeof glossClientPhotos)[number];
  index: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`wavy wavy-${index + 1}`}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={photo.alt}
          className="wavy-photo"
          style={photo.objectPosition ? { objectPosition: photo.objectPosition } : undefined}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="wavy-placeholder" aria-hidden />
      )}
    </div>
  );
}
