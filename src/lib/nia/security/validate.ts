const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 2000;
const MAX_NAME = 120;

export type KontaktFields = { name: string; email: string; message: string; budget?: string };
export type KonzultaceFields = KontaktFields & { phone: string; dateIso: string; time: string };

export function validateKontakt(body: Record<string, unknown>): { ok: true; data: KontaktFields } | { ok: false; error: string } {
  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  const budget = typeof body.budget === "string" ? body.budget.trim().slice(0, 80) : "";

  if (name.length < 2) return { ok: false, error: "Vyplň jméno." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Vyplň platný e-mail." };
  if (message.length < 4) return { ok: false, error: "Napiš zprávu." };

  return { ok: true, data: { name, email, message, ...(budget ? { budget } : {}) } };
}

export function validateKonzultace(
  body: Record<string, unknown>,
): { ok: true; data: KonzultaceFields } | { ok: false; error: string } {
  const base = validateKontakt(body);
  if (!base.ok) return base;

  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const dateIso = typeof body.date === "string" ? body.date.trim() : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");

  if (phoneDigits.length < 9) return { ok: false, error: "Vyplň telefon (min. 9 číslic)." };
  if (base.data.message.length < 8) {
    return { ok: false, error: "Vyplň obor webu a krátkou poznámku." };
  }

  return {
    ok: true,
    data: { ...base.data, phone, dateIso, time },
  };
}

export function fakeOkResponse() {
  return { ok: true as const };
}

export const RATE_LIMIT_MESSAGE =
  "Zkus to prosím později nebo mi napiš na niadobysar@gmail.com.";
