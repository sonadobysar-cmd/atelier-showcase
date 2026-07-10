import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";

export type SubmissionFilter =
  | "ok"
  | "turnstile"
  | "honeypot"
  | "time_trap"
  | "rate_limit"
  | "origin"
  | "validation"
  | "config";

export type SubmissionLogEntry = {
  id: string;
  ts: string;
  endpoint: "kontakt" | "konzultace-get" | "konzultace-post" | "form-config";
  ip: string;
  userAgent: string;
  origin: string;
  referer: string;
  filter: SubmissionFilter;
  processed: boolean;
  note?: string;
  payload?: Record<string, unknown>;
};

const LOG_KEY = "nia:submission-logs";
const MAX_LOGS = 20_000;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function sanitizePayload(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "turnstileToken" || k === "formToken" || k === "cf-turnstile-response") continue;
    if (typeof v === "string") {
      out[k] = v.length > 500 ? `${v.slice(0, 500)}…` : v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

export async function logSubmission(
  entry: Omit<SubmissionLogEntry, "id" | "ts"> & { payload?: Record<string, unknown> },
): Promise<void> {
  const row: SubmissionLogEntry = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    ...entry,
    payload: entry.payload ? sanitizePayload(entry.payload) : undefined,
  };

  const r = getRedis();
  if (!r) {
    console.warn("[nia/security/log]", JSON.stringify(row));
    return;
  }

  try {
    await r.lpush(LOG_KEY, JSON.stringify(row));
    await r.ltrim(LOG_KEY, 0, MAX_LOGS - 1);
  } catch (err) {
    console.error("[nia/security/log] persist failed", err, row);
  }
}

export async function listSubmissionLogs(limit = 500, offset = 0): Promise<SubmissionLogEntry[]> {
  const r = getRedis();
  if (!r) return [];
  const end = offset + limit - 1;
  const raw = await r.lrange(LOG_KEY, offset, end);
  const rows: SubmissionLogEntry[] = [];
  for (const item of raw) {
    try {
      rows.push(typeof item === "string" ? (JSON.parse(item) as SubmissionLogEntry) : (item as SubmissionLogEntry));
    } catch {
      /* skip corrupt */
    }
  }
  return rows;
}

export async function exportSubmissionLogs(): Promise<SubmissionLogEntry[]> {
  const r = getRedis();
  if (!r) return [];
  const raw = await r.lrange(LOG_KEY, 0, MAX_LOGS - 1);
  const rows: SubmissionLogEntry[] = [];
  for (const item of raw) {
    try {
      rows.push(typeof item === "string" ? (JSON.parse(item) as SubmissionLogEntry) : (item as SubmissionLogEntry));
    } catch {
      /* skip */
    }
  }
  return rows;
}
