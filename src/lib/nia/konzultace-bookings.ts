import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { KonzBooking, KonzBookingInput } from "@/lib/nia/konzultace-bookings-types";
import { PENDING_TTL_MS } from "@/lib/nia/konzultace-bookings-types";

export type { KonzBooking, KonzBookingInput } from "@/lib/nia/konzultace-bookings-types";

const BLOB_PATH = "nia-konzultace/bookings.json";
const DATA_DIR = process.env.NIA_BOOKINGS_DATA_DIR || path.join(process.cwd(), "data", "nia-konzultace");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

function usesBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function normalizeBooking(raw: KonzBooking): KonzBooking {
  if (!raw.status) {
    return { ...raw, status: "confirmed", confirmedAt: raw.createdAt };
  }
  return raw;
}

function isExpiredPending(b: KonzBooking, now = Date.now()): boolean {
  if (b.status !== "pending" || b.cancelledAt) return false;
  if (!b.expiresAt) return false;
  return Date.parse(b.expiresAt) <= now;
}

function blocksSlot(b: KonzBooking, now = Date.now()): boolean {
  if (b.cancelledAt) return false;
  if (b.status === "confirmed") return true;
  if (b.status === "pending" && !isExpiredPending(b, now)) return true;
  return false;
}

async function readAllUnsafe(): Promise<KonzBooking[]> {
  if (usesBlobStore()) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(BLOB_PATH, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) return [];
      const raw = await new Response(result.stream).text();
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map((b) => normalizeBooking(b as KonzBooking)) : [];
    } catch {
      return [];
    }
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map((b) => normalizeBooking(b as KonzBooking)) : [];
  } catch {
    return [];
  }
}

async function writeAllUnsafe(bookings: KonzBooking[]) {
  const payload = JSON.stringify(bookings, null, 2);

  if (usesBlobStore()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, payload, "utf-8");
}

async function purgeExpiredPending(bookings: KonzBooking[]): Promise<KonzBooking[]> {
  const now = Date.now();
  let changed = false;
  const next = bookings.map((b) => {
    if (isExpiredPending(b, now)) {
      changed = true;
      return { ...b, cancelledAt: new Date(now).toISOString() };
    }
    return b;
  });
  if (changed) await writeAllUnsafe(next);
  return next;
}

export async function listBookings() {
  const bookings = await readAllUnsafe();
  return purgeExpiredPending(bookings);
}

export async function listActiveBookings(from = new Date()) {
  const { pragueTodayIso } = await import("@/lib/nia/konzultace-time");
  const todayIso = pragueTodayIso(from);
  const bookings = await purgeExpiredPending(await readAllUnsafe());
  return bookings.filter((b) => {
    if (!blocksSlot(b)) return false;
    return b.dateIso >= todayIso;
  });
}

export function bookedSlotsMap(bookings: { dateIso: string; time: string; cancelledAt?: string; status?: string }[]) {
  const map: Record<string, string[]> = {};
  for (const b of bookings) {
    if (!blocksSlot(b as KonzBooking)) continue;
    if (!map[b.dateIso]) map[b.dateIso] = [];
    if (!map[b.dateIso].includes(b.time)) map[b.dateIso].push(b.time);
  }
  return map;
}

export async function isSlotBooked(dateIso: string, time: string): Promise<boolean> {
  const bookings = await purgeExpiredPending(await readAllUnsafe());
  return bookings.some((b) => blocksSlot(b) && b.dateIso === dateIso && b.time === time);
}

export async function createBooking(input: KonzBookingInput) {
  const bookings = await purgeExpiredPending(await readAllUnsafe());
  const taken = bookings.some((b) => blocksSlot(b) && b.dateIso === input.dateIso && b.time === input.time);
  if (taken) return { ok: false as const, error: "Tento termín už není k dispozici. Vyber jiný." };

  const now = new Date();
  const booking: KonzBooking = {
    id: randomUUID(),
    ...input,
    createdAt: now.toISOString(),
    status: "pending",
    expiresAt: new Date(now.getTime() + PENDING_TTL_MS).toISOString(),
  };
  bookings.push(booking);
  await writeAllUnsafe(bookings);
  return { ok: true as const, booking };
}

export async function confirmBooking(ref: string): Promise<boolean> {
  const bookings = await readAllUnsafe();
  let changed = false;
  const next = bookings.map((b) => {
    if (b.ref !== ref || b.status !== "pending" || b.cancelledAt) return b;
    changed = true;
    return {
      ...b,
      status: "confirmed" as const,
      confirmedAt: new Date().toISOString(),
      expiresAt: undefined,
    };
  });
  if (changed) await writeAllUnsafe(next);
  return changed;
}
