import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const VINI_ADMIN_COOKIE = process.env.NODE_ENV === "production" ? "__Host-vini_admin" : "vini_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;

type Session = { email: string; exp: number; csrf: string };

function secret(): string | null {
  const value = process.env.VINI_ADMIN_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function sign(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function adminConfigured(): boolean {
  return Boolean(secret() && process.env.VINI_ADMIN_PASSWORD_HASH?.trim());
}

export function verifyAdminCredentials(email: unknown, password: unknown): boolean {
  if (typeof email !== "string" || typeof password !== "string" || password.length > 256) return false;
  const expectedEmail = (process.env.VINI_ADMIN_EMAIL || "info@vinidelite.cz").trim().toLowerCase();
  if (email.trim().toLowerCase() !== expectedEmail) return false;
  const stored = process.env.VINI_ADMIN_PASSWORD_HASH?.trim() || "";
  const [algorithm, saltEncoded, digestEncoded] = stored.split("$");
  if (algorithm !== "scrypt" || !saltEncoded || !digestEncoded) return false;
  try {
    const salt = Buffer.from(saltEncoded, "base64url");
    const expected = Buffer.from(digestEncoded, "base64url");
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createAdminSession(email: string): { token: string; csrf: string; expires: Date } {
  const key = secret();
  if (!key) throw new Error("VINI_ADMIN_NOT_CONFIGURED");
  const session: Session = { email: email.trim().toLowerCase(), exp: Date.now() + SESSION_MS, csrf: randomBytes(24).toString("base64url") };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return { token: `${payload}.${sign(payload, key)}`, csrf: session.csrf, expires: new Date(session.exp) };
}

export function readAdminSession(request: NextRequest | Request): Session | null {
  const key = secret();
  if (!key) return null;
  let token = "";
  if ("cookies" in request) token = request.cookies.get(VINI_ADMIN_COOKIE)?.value || "";
  else {
    const raw = request.headers.get("cookie") || "";
    token = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${VINI_ADMIN_COOKIE}=`))?.slice(VINI_ADMIN_COOKIE.length + 1) || "";
  }
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const supplied = token.slice(dot + 1);
  try {
    const expected = sign(payload, key);
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!session.email || !session.csrf || !Number.isFinite(session.exp) || session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function validCsrf(request: NextRequest | Request, session: Session): boolean {
  const supplied = request.headers.get("x-vini-csrf") || "";
  if (!supplied || supplied.length !== session.csrf.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(session.csrf));
}

export function passwordHash(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64url")}$${scryptSync(password, salt, 32).toString("base64url")}`;
}
