/** Minimální předstih rezervace (minuty) — nelze rezervovat „za 5 minut“. */
export const KONZ_MIN_LEAD_MIN = 30;

export const PRAGUE_TZ = "Europe/Prague";

type PragueParts = { year: number; month: number; day: number; hour: number; minute: number };

export function pragueNowParts(now = new Date()): PragueParts {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: PRAGUE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
  };
}

export function pragueTodayIso(now = new Date()): string {
  const p = pragueNowParts(now);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Je slot v budoucnosti včetně minimálního předstihu? */
export function isSlotBookableInFuture(
  dateIso: string,
  time: string,
  minLeadMin = KONZ_MIN_LEAD_MIN,
  now = new Date(),
): boolean {
  const todayIso = pragueTodayIso(now);
  if (dateIso < todayIso) return false;
  if (dateIso > todayIso) return true;
  const p = pragueNowParts(now);
  const nowMin = p.hour * 60 + p.minute;
  return timeToMinutes(time) >= nowMin + minLeadMin;
}

export function filterBookableTimes(
  dateIso: string,
  times: string[],
  minLeadMin = KONZ_MIN_LEAD_MIN,
  now = new Date(),
): string[] {
  return times.filter((t) => isSlotBookableInFuture(dateIso, t, minLeadMin, now));
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
