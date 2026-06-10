"use client";

import { useState } from "react";
import { getGlossFieldArt } from "@/lib/gloss-art";
import { glossFields, type GlossField } from "@/lib/gloss-data";

type Props = {
  onReserve: (procedureName: string) => void;
};

export function GlossFields({ onReserve }: Props) {
  const [openIdx, setOpenIdx] = useState(-1);

  const toggleField = (i: number) => {
    setOpenIdx((prev) => (prev === i ? -1 : i));
  };

  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const art = card.querySelector<HTMLElement>(".art");
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = `translateY(-10px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`;
    if (art) {
      art.style.setProperty("--mx", `${px * 100}%`);
      art.style.setProperty("--my", `${py * 100}%`);
    }
  };

  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  };

  const openField = openIdx >= 0 ? glossFields[openIdx] : null;

  return (
    <div className="fields-row">
      {glossFields.map((field, i) => (
        <FieldCard
          key={field.id}
          field={field}
          active={openIdx === i}
          onClick={() => toggleField(i)}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
        />
      ))}
      <div className={`proc-panel ${openField ? "open" : ""}`}>
        {openField && (
          <div className="proc-inner">
            <h4>{openField.name}</h4>
            <p className="lead">{openField.lead}</p>
            <div className="proc-list">
              {openField.procedures.map((p) => (
                <div key={p.name} className="proc-item">
                  <div className="top">
                    <h5>{p.name}</h5>
                    <span className="pr">{p.price}</span>
                  </div>
                  <div className="dur">{p.duration}</div>
                  <p>{p.description}</p>
                  <button type="button" className="pick" onClick={() => onReserve(p.name)}>
                    Rezervovat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldCard({
  field,
  active,
  onClick,
  onMouseMove,
  onMouseLeave,
}: {
  field: GlossField;
  active: boolean;
  onClick: () => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const visual = field.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={field.image}
      alt={field.name}
      className="field-art-img"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: field.imagePosition ?? "center center",
        display: "block",
      }}
    />
  ) : (
    <div dangerouslySetInnerHTML={{ __html: getGlossFieldArt(field.artKey) }} />
  );

  return (
    <div
      className={`field-card ${active ? "active" : ""}`}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
    >
      <div className="art">
        {visual}
        <div className="glow" />
      </div>
      <div className="body">
        <h3>{field.name}</h3>
        <p className="field-sub">{field.subtitle}</p>
        <div className="toggle">
          Procedury <span className="chev">▾</span>
        </div>
      </div>
    </div>
  );
}
