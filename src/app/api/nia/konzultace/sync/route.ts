import { NextResponse } from "next/server";
import { listActiveBookings } from "@/lib/nia/konzultace-bookings";
import { KONZ_DURATION_MIN } from "@/lib/nia/konzultace-schedule";

export const runtime = "nodejs";

function bookingTitle(b: { name: string; message: string }): string {
  const name = b.name.trim();
  const msg = b.message.trim();
  if (msg.length >= 3) {
    const short = msg.length > 48 ? `${msg.slice(0, 45)}…` : msg;
    return `${name} · ${short}`;
  }
  return `Online konzultace · ${name}`;
}

function checkAuth(req: Request): boolean {
  const secret = process.env.UPOMINKY_SYNC_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  if (auth === `Bearer ${secret}`) return true;
  const header = req.headers.get("x-upominky-token")?.trim() ?? "";
  return header === secret;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  const bookings = (await listActiveBookings()).filter((b) => b.status === "confirmed");
  return NextResponse.json({
    ok: true,
    bookings: bookings.map((b) => ({
      ref: b.ref,
      clientName: b.name,
      title: bookingTitle(b),
      dateIso: b.dateIso,
      time: b.time,
      meetUrl: b.meetUrl,
      message: b.message,
      durationMin: KONZ_DURATION_MIN,
    })),
  });
}
