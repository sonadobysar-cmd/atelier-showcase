"use client";

import { useState } from "react";
import { getDemoSlots, type BookingService } from "@/lib/booking";

export function BookingDemo({
  services,
  accent,
}: {
  services: BookingService[];
  accent: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [slotId, setSlotId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const slots = getDemoSlots();
  const selected = services.find((s) => s.id === serviceId);

  if (submitted) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}
      >
        <p className="font-display text-2xl">Děkujeme!</p>
        <p className="mt-2 text-sm opacity-70">
          Demo rezervace odeslána. V produkci by zde přišel e-mail a kalendář.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setSlotId("");
          }}
          className="mt-6 text-sm underline opacity-60"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white/50 p-6 sm:p-8">
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-widest opacity-50">
        <span className={step >= 1 ? "opacity-100" : ""}>1. Služba</span>
        <span>·</span>
        <span className={step >= 2 ? "opacity-100" : ""}>2. Termín</span>
        <span>·</span>
        <span className={step >= 3 ? "opacity-100" : ""}>3. Kontakt</span>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceId(s.id)}
              className="flex w-full items-center justify-between rounded-xl border p-4 text-left transition"
              style={{
                borderColor: serviceId === s.id ? accent : "rgba(0,0,0,0.08)",
                backgroundColor: serviceId === s.id ? `${accent}12` : "transparent",
              }}
            >
              <span>
                <span className="block font-medium">{s.name}</span>
                <span className="text-sm opacity-60">{s.duration}</span>
              </span>
              <span className="font-medium">{s.price}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 w-full rounded-full py-3 text-sm font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Pokračovat
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4 text-sm opacity-60">
            Vybráno: <strong>{selected?.name}</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                disabled={!slot.available}
                onClick={() => setSlotId(slot.id)}
                className="rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  borderColor: slotId === slot.id ? accent : "rgba(0,0,0,0.08)",
                  backgroundColor: slotId === slot.id ? `${accent}12` : "transparent",
                }}
              >
                {slot.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="text-sm opacity-50">
              Zpět
            </button>
            <button
              type="button"
              disabled={!slotId}
              onClick={() => setStep(3)}
              className="flex-1 rounded-full py-3 text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              Pokračovat
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input
            required
            placeholder="Jméno a příjmení"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
          />
          <input
            type="tel"
            placeholder="Telefon"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
          />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="text-sm opacity-50">
              Zpět
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full py-3 text-sm font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              Odeslat rezervaci
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
