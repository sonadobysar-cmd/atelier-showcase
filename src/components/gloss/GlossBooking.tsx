"use client";

import { useState } from "react";
import { allGlossProcedures, glossTimeSlots } from "@/lib/gloss-data";
import { GlossReveal } from "@/components/gloss/GlossReveal";

type Props = {
  selectedProc: string;
  onSelectProc: (name: string) => void;
};

export function GlossBooking({ selectedProc, onSelectProc }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const contact = String(fd.get("contact") ?? "").trim();
    const date = String(fd.get("date") ?? "");
    const time = String(fd.get("time") ?? "");

    if (!selectedProc) {
      alert("Vyber prosím proceduru.");
      return;
    }
    if (!name || !contact) {
      alert("Vyplň prosím jméno a kontakt.");
      return;
    }
    if (!date || !time) {
      alert("Vyber prosím datum a čas.");
      return;
    }

    setConfirmMsg(
      `Děkujeme, <b>${name}</b>! Rezervaci na <b>${selectedProc}</b> dne <b>${date}</b> v <b>${time}</b> jsme přijaly. Welcome drink už chladíme. ✦`,
    );
    setConfirmed(true);
  };

  return (
    <section id="rezervace">
      <GlossReveal>
        <div className="sec-head">
          <div className="sec-eyebrow">Rezervace</div>
          <h2 className="sec-title">
            Zarezervuj si <em className="shine">svůj glow</em>
          </h2>
          <p className="sec-note">
            Vyber proceduru a termín. Formulář je připravený na napojení rezervačního systému.
          </p>
        </div>
      </GlossReveal>

      <GlossReveal>
        <div className="book-card">
          {!confirmed ? (
            <form id="formInner" onSubmit={submit}>
              <div className="field">
                <label>Procedura</label>
                <div className="chips">
                  {allGlossProcedures.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className={`chip ${selectedProc === p.name ? "active" : ""}`}
                      onClick={() => onSelectProc(p.name)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="fName">Jméno</label>
                <input id="fName" name="name" type="text" placeholder="Tvoje jméno" required />
              </div>
              <div className="field">
                <label htmlFor="fContact">Telefon / e-mail</label>
                <input id="fContact" name="contact" type="text" placeholder="Kam ti napíšeme" required />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="fDate">Datum</label>
                  <input id="fDate" name="date" type="date" required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="fTime">Čas</label>
                  <select id="fTime" name="time" defaultValue="" required>
                    <option value="">Vyber</option>
                    {glossTimeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="fNote">Poznámka (volitelné)</label>
                <textarea id="fNote" name="note" rows={2} placeholder="Cokoliv, co bychom měly vědět" />
              </div>
              <button type="submit" className="submit">
                Odeslat rezervaci
              </button>
              <p className="cursor-note">✦ Připraveno pro napojení rezervačního systému (data-booking hook)</p>
            </form>
          ) : (
            <div className="confirm show">
              <div className="check">✓</div>
              <h4>Rezervace odeslána!</h4>
              <p dangerouslySetInnerHTML={{ __html: confirmMsg }} />
            </div>
          )}
        </div>
      </GlossReveal>
    </section>
  );
}
