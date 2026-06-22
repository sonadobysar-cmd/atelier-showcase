import { NextResponse } from "next/server";
import { listActiveBookings } from "@/lib/nia/konzultace-bookings";

export const runtime = "nodejs";

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

  const bookings = await listActiveBookings();
  return NextResponse.json({
    ok: true,
    bookings: bookings.map((b) => ({
      ref: b.ref,
      clientName: b.name,
      title: `Konzultace — ${b.name}`,
      dateIso: b.dateIso,
      time: b.time,
      meetUrl: b.meetUrl,
      message: b.message,
      createdAt: b.createdAt,
    })),
  });
}
