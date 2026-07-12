import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec?: number };

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function limiter(prefix: string, count: number, window: `${number} s` | `${number} m` | `${number} h` | `${number} d`) {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(count, window),
    prefix: `nia:${prefix}`,
    analytics: true,
  });
}

async function check(limiter: Ratelimit | null, key: string): Promise<RateLimitResult> {
  if (!limiter) {
    if (process.env.NODE_ENV === "development") return { ok: true };
    return { ok: false, retryAfterSec: 60 };
  }
  const { success, reset } = await limiter.limit(key);
  if (success) return { ok: true };
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { ok: false, retryAfterSec };
}

export async function rateLimitKontakt(ip: string): Promise<RateLimitResult> {
  const hour = limiter("kontakt:hour", 3, "1 h");
  const day = limiter("kontakt:day", 5, "24 h");
  const h = await check(hour, ip);
  if (!h.ok) return h;
  return check(day, ip);
}

export async function rateLimitKonzultaceRead(ip: string): Promise<RateLimitResult> {
  return check(limiter("konzultace:read", 30, "1 h"), ip);
}

export async function rateLimitKonzultaceCreate(ip: string, email: string): Promise<RateLimitResult> {
  const hourIp = limiter("konzultace:create:ip", 3, "1 h");
  const hourEmail = limiter("konzultace:create:email", 3, "1 h");
  const ipRes = await check(hourIp, ip);
  if (!ipRes.ok) return ipRes;
  return check(hourEmail, email.toLowerCase());
}

export async function rateLimitFormConfig(ip: string): Promise<RateLimitResult> {
  return check(limiter("form-config", 25, "1 h"), ip);
}

export function upstashConfigured(): boolean {
  return Boolean(getRedis());
}
