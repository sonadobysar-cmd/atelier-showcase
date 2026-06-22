import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { KonzBookingInput } from "@/lib/nia/konzultace-bookings-types";

export type { KonzBooking, KonzBookingInput } from "@/lib/nia/konzultace-bookings-types";

const BLOB_PATH = "nia-konzultace/bookings.json";
const DATA_DIR = process.env.NIA_BOOKINGS_DATA_DIR || path.join(process.cwd(), "data", "nia-konzultace");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

async function readAllUnsafe(): Promise<import("@/lib/nia/konzultace-bookings-types").KonzBooking[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { head } = await import("@vercel/blob");
      const meta = await head(BLOB_PATH);
      const res = await fetch(meta.url);
      if (!res.ok) return [];
      const parsed = (await res.json()) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAllUnsafe(bookings: import("@/lib/nia/konzultace-bookings-types").KonzBooking[]) {
  const payload = JSON.stringify(bookings, null, 2);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, payload, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, payload, "utf-8");
}

export async function listBookings() {
  return readAllUnsafe();
}

export async function listActiveBookings(from = new Date()) {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const bookings = await readAllUnsafe();
  return bookings.filter((b) => {
    if (b.cancelledAt) return false;
    const [y, mo, d] = b.dateIso.split("-").map(Number);
    const dt = new Date(y, mo - 1, d, 23, 59, 59, 999);
    return dt >= today;
  });
}

export function bookedSlotsMap(bookings: { dateIso: string; time: string; cancelledAt?: string }[]) {
  const map: Record<string, string[]> = {};
  for (const b of bookings) {
    if (b.cancelledAt) continue;
    if (!map[b.dateIso]) map[b.dateIso] = [];
    if (!map[b.dateIso].includes(b.time)) map[b.dateIso].push(b.time);
  }
  return map;
}

export async function isSlotBooked(dateIso: string, time: string): Promise<boolean> {
  const bookings = await readAllUnsafe();
  return bookings.some((b) => !b.cancelledAt && b.dateIso === dateIso && b.time === time);
}

export async function createBooking(input: KonzBookingInput) {
  const bookings = await readAllUnsafe();
  const taken = bookings.some((b) => !b.cancelledAt && b.dateIso === input.dateIso && b.time === input.time);
  if (taken) return { ok: false as const, error: "Tento termín už není k dispozici. Vyber jiný." };

  const booking = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  await writeAllUnsafe(bookings);
  return { ok: true as const, booking };
}
