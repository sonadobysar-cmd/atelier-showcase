import { NextResponse } from "next/server";
import {
  buildAdminNotificationHtml,
  buildAdminNotificationText,
  buildClientConfirmationHtml,
  buildClientConfirmationText,
} from "@/lib/nia/konzultace-email";
import {
  formatDateIso,
  isValidSlot,
  scheduleForClient,
} from "@/lib/nia/konzultace-schedule";
import { resendSend, resolveNiaFrom, resolveNiaTo } from "@/lib/nia/resend";
import {
  bookedSlotsMap,
  createBooking,
  isSlotBooked,
  listActiveBookings,
} from "@/lib/nia/konzultace-bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeRef(): string {
  const d = new Date();
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `NIA-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(Math.floor(Math.random() * 10000), 4)}`;
}

export async function GET() {
  const meetUrl = process.env.NIA_GOOGLE_MEET_URL?.trim() || "";
  const active = await listActiveBookings();
  const booked = bookedSlotsMap(active);
  return NextResponse.json(
    {
      ...scheduleForClient(booked),
      meetConfigured: meetUrl.length > 0,
      onlineOnly: true,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(req: Request) {
  try {
    return await handlePost(req);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[nia/konzultace] POST failed", detail, err);
    return NextResponse.json(
      { ok: false, error: "Rezervace se nepodařila uložit. Zkus to znovu nebo napiš na niadobysar@gmail.com." },
      { status: 500 },
    );
  }
}

async function handlePost(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Chybí údaje." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const hp = typeof b.website === "string" ? b.website.trim() : "";
  if (hp.length > 0) return NextResponse.json({ ok: true });

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  const dateIso = typeof b.date === "string" ? b.date.trim() : "";
  const time = typeof b.time === "string" ? b.time.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Vyplň jméno." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Vyplň platný e-mail." }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 9) {
    return NextResponse.json({ ok: false, error: "Vyplň telefon (min. 9 číslic)." }, { status: 400 });
  }
  if (message.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Vyplň obor webu a krátkou poznámku (např. kadeřnictví + co potřebuješ)." },
      { status: 400 },
    );
  }
  if (!isValidSlot(dateIso, time)) {
    return NextResponse.json({ ok: false, error: "Tento termín už není k dispozici. Vyber jiný." }, { status: 400 });
  }
  if (await isSlotBooked(dateIso, time)) {
    return NextResponse.json({ ok: false, error: "Tento termín už není k dispozici. Vyber jiný." }, { status: 409 });
  }

  const meetUrl = process.env.NIA_GOOGLE_MEET_URL?.trim();
  if (!meetUrl) {
    return NextResponse.json(
      { ok: false, error: "Rezervace je dočasně nedostupná. Napiš na niadobysar@gmail.com." },
      { status: 503 },
    );
  }

  const [y, mo, d] = dateIso.split("-").map(Number);
  const date = new Date(y, mo - 1, d, 12, 0, 0, 0);
  const ref = makeRef();
  const booking = { ref, name, email, phone, message, date, time, meetUrl };

  const saved = await createBooking({
    ref,
    name,
    email,
    phone,
    message,
    dateIso,
    time,
    meetUrl,
  });
  if (!saved.ok) {
    return NextResponse.json({ ok: false, error: saved.error }, { status: 409 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[nia/konzultace] RESEND_API_KEY missing — booking saved", ref);
    return NextResponse.json({
      ok: true,
      ref,
      meetUrl,
      date: formatDateIso(date),
      time,
      emailSent: false,
    });
  }

  const from = resolveNiaFrom();
  const adminTo = resolveNiaTo();

  let emailSent = false;
  try {
    const clientRes = await resendSend(apiKey, {
      from,
      to: [email],
      reply_to: adminTo,
      subject: `Potvrzení konzultace · ${ref} · Nia Dobyšar`,
      html: buildClientConfirmationHtml(booking),
      text: buildClientConfirmationText(booking),
    });

    if (!clientRes.ok) {
      console.error("[nia/konzultace] client email failed", clientRes.status, clientRes.body, "from=", from);
    } else {
      emailSent = true;
    }

    const adminRes = await resendSend(apiKey, {
      from,
      to: [adminTo],
      reply_to: email,
      subject: `Rezervace konzultace · ${name} · ${ref}`,
      html: buildAdminNotificationHtml(booking),
      text: buildAdminNotificationText(booking),
    });

    if (!adminRes.ok) {
      console.error("[nia/konzultace] admin email failed", adminRes.status, adminRes.body);
    }
  } catch (err) {
    console.error("[nia/konzultace] email error", err);
  }

  return NextResponse.json({
    ok: true,
    ref,
    meetUrl,
    date: formatDateIso(date),
    time,
    emailSent,
  });
}
