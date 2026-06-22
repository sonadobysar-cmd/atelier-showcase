/** Dostupnost online konzultací (Europe/Prague). day: 0=Ne … 6=So */
export const KONZ_DURATION_MIN = 30;

export type DayWindow = { fromHour: number; fromMin: number; toHour: number; toMin: number };

/** null = jen po domluvě e-mailem */
export const KONZ_WEEKLY: Record<number, DayWindow | null> = {
  0: null,
  1: { fromHour: 14, fromMin: 0, toHour: 21, toMin: 0 },
  2: { fromHour: 11, fromMin: 0, toHour: 18, toMin: 0 },
  3: { fromHour: 14, fromMin: 0, toHour: 22, toMin: 0 },
  4: { fromHour: 14, fromMin: 0, toHour: 22, toMin: 0 },
  5: { fromHour: 11, fromMin: 0, toHour: 16, toMin: 0 },
  6: null,
};

export const KONZ_BOOKABLE_DAYS = [1, 2, 3, 4, 5] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

export function timesForWeekday(dayOfWeek: number): string[] {
  const w = KONZ_WEEKLY[dayOfWeek];
  if (!w) return [];
  const start = toMinutes(w.fromHour, w.fromMin);
  const end = toMinutes(w.toHour, w.toMin);
  const out: string[] = [];
  for (let t = start; t + KONZ_DURATION_MIN <= end; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    out.push(`${pad(h)}:${pad(m)}`);
  }
  return out;
}

export function nextBookableDates(count: number, from = new Date()): Date[] {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const out: Date[] = [];
  let guard = 0;
  while (out.length < count && guard < 120) {
    if (KONZ_BOOKABLE_DAYS.includes(d.getDay() as (typeof KONZ_BOOKABLE_DAYS)[number])) {
      out.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
    guard += 1;
  }
  return out;
}

export function formatDateCs(dt: Date): string {
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`;
}

export function formatDateIso(dt: Date): string {
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const day = pad(dt.getDate());
  return `${y}-${m}-${day}`;
}

const DNY = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

export function formatWhen(dt: Date, time: string): string {
  return `${DNY[dt.getDay()]} ${formatDateCs(dt)} · ${time}`;
}

export function isValidSlot(dateIso: string, time: string, booked?: Record<string, string[]>): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const [y, mo, d] = dateIso.split("-").map(Number);
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dt < today) return false;
  if (!timesForWeekday(dt.getDay()).includes(time)) return false;
  if (booked?.[dateIso]?.includes(time)) return false;
  return true;
}

export function scheduleForClient(booked: Record<string, string[]> = {}, horizonDays = 28) {
  const calendar: Record<string, string[]> = {};
  const dates = nextBookableDates(horizonDays);
  for (const dt of dates) {
    const iso = formatDateIso(dt);
    const available = timesForWeekday(dt.getDay()).filter((t) => !booked[iso]?.includes(t));
    if (available.length > 0) calendar[iso] = available;
  }

  return {
    durationMin: KONZ_DURATION_MIN,
    bookableDays: KONZ_BOOKABLE_DAYS,
    days: horizonDays,
    calendar,
    weekly: Object.fromEntries(
      Object.entries(KONZ_WEEKLY).map(([k, v]) => [
        k,
        v
          ? {
              times: timesForWeekday(Number(k)),
              label: `${pad(v.fromHour)}:${pad(v.fromMin)}–${pad(v.toHour)}:${pad(v.toMin)}`,
            }
          : null,
      ]),
    ),
  };
}
