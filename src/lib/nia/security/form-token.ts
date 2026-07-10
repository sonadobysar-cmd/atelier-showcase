import { createHmac, timingSafeEqual } from "crypto";

const MIN_AGE_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function secret(): string | null {
  const s = process.env.NIA_FORM_TOKEN_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

function sign(ts: string, key: string): string {
  return createHmac("sha256", key).update(ts).digest("base64url");
}

export function mintFormToken(): string | null {
  const key = secret();
  if (!key) return null;
  const ts = String(Date.now());
  return `${ts}.${sign(ts, key)}`;
}

export function verifyFormToken(token: unknown): boolean {
  const key = secret();
  if (!key || typeof token !== "string" || !token.includes(".")) return false;

  const dot = token.indexOf(".");
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!ts || !sig || !/^\d+$/.test(ts)) return false;

  const expected = sign(ts, key);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const age = Date.now() - Number(ts);
  return age >= MIN_AGE_MS && age <= MAX_AGE_MS;
}
