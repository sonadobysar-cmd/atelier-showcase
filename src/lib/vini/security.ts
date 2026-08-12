import { createHmac, timingSafeEqual } from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;
const memory = new Map<string, number[]>();

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

export function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim().slice(0, 80);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")?.toLowerCase().replace(/\/$/, "");
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(",")[0].trim().toLowerCase();
  const proto = (request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")).split(",")[0].trim().toLowerCase();
  const site = request.headers.get("sec-fetch-site");
  // Browsers do not consistently attach Origin to same-origin GET requests.
  // Allow only this read-only Fetch Metadata case. Every state-changing
  // request still requires the exact Origin match below.
  if (!origin) return request.method === "GET" && site === "same-origin" && Boolean(host);
  const direct = origin === `${proto}://${host}` && (!site || site === "same-origin");
  if (direct) return true;
  // The public Vini project proxies its same-origin API calls to this central
  // backend. Only the two canonical storefront origins are trusted, and the
  // browser never receives CORS permission for direct cross-site calls.
  const canonicalVini = origin === "https://www.vinidelite.cz" || origin === "https://vinidelite.cz";
  return canonicalVini && host === "atelier-showcase-cyan.vercel.app";
}

export async function limit(key: string, count: number, seconds: number): Promise<{ ok: boolean; retryAfter: number }> {
  const store = getRedis();
  if (store) {
    const result = await new Ratelimit({ redis: store, limiter: Ratelimit.slidingWindow(count, `${seconds} s`), prefix: "vini:security", analytics: true }).limit(key);
    return { ok: result.success, retryAfter: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
  }
  // A memory-only limiter is not shared between serverless instances. In
  // production, fail closed unless the distributed Upstash store is present.
  if (process.env.NODE_ENV === "production" && process.env.VINI_LOCAL_TEST_MODE !== "1") {
    return { ok: false, retryAfter: 60 };
  }
  const now = Date.now();
  const values = (memory.get(key) || []).filter((stamp) => now - stamp < seconds * 1000);
  values.push(now);
  memory.set(key, values);
  return { ok: values.length <= count, retryAfter: seconds };
}

export function noStoreHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { "Cache-Control": "no-store, max-age=0", Pragma: "no-cache", "X-Content-Type-Options": "nosniff", ...extra };
}

function formSecret(): string | null {
  const value = (process.env.VINI_FORM_TOKEN_SECRET || process.env.NIA_FORM_TOKEN_SECRET || "").trim();
  return value.length >= 24 ? value : null;
}

export function mintFormToken(): string | null {
  const key = formSecret();
  if (!key) return null;
  const timestamp = String(Date.now());
  return `${timestamp}.${createHmac("sha256", key).update(timestamp).digest("base64url")}`;
}

export function verifyFormToken(value: unknown): boolean {
  const key = formSecret();
  if (!key || typeof value !== "string") return false;
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const timestamp = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!/^\d+$/.test(timestamp)) return false;
  const age = Date.now() - Number(timestamp);
  if (age < 2500 || age > 2 * 60 * 60 * 1000) return false;
  try {
    const expected = createHmac("sha256", key).update(timestamp).digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
