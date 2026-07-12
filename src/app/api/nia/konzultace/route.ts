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
  confirmBooking,
  createBooking,
  isSlotBooked,
  listActiveBookings,
} from "@/lib/nia/konzultace-bookings";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { guardFormRequest, handleOptions } from "@/lib/nia/security/form-guard";
import { logSubmission } from "@/lib/nia/security/submission-log";
import { validateKonzultace } from "@/lib/nia/security/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeRef(): string {
  const d = new Date();
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `NIA-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(Math.floor(Math.random() * 10000), 4)}`;
}

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  const guard = await guardFormRequest({
    endpoint: "konzultace-get",
    req,
    requireTurnstile: false,
  });
  if (!guard.allowed) return guard.response;

  const meetUrl = process.env.NIA_GOOGLE_MEET_URL?.trim() || "";
  const active = await listActiveBookings();
  const booked = bookedSlotsMap(active);

  await logSubmission({
    endpoint: "konzultace-get",
    ip: guard.meta.ip,
    userAgent: guard.meta.userAgent,
    origin: guard.meta.origin,
    referer: guard.meta.referer,
    filter: "ok",
    processed: true,
  });

  return NextResponse.json(
    {
      ...scheduleForClient(booked),
      meetConfigured: meetUrl.length > 0,
      onlineOnly: true,
    },
    { headers: { ...corsHeaders(req.headers.get("origin")), "Cache-Control": "no-store, max-age=0" } },
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
      { status: 500, headers: corsHeaders(req.headers.get("origin")) },
    );
  }
}

async function handlePost(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." }, { status: 400, headers: corsHeaders(req.headers.get("origin")) });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Chybí údaje." }, { status: 400, headers: corsHeaders(req.headers.get("origin")) });
  }

  const b = body as Record<string, unknown>;
  const emailPreview = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";

  const guard = await guardFormRequest({
    endpoint: "konzultace-post",
    req,
    body: b,
    emailForLimit: emailPreview,
  });
  if (!guard.allowed) return guard.response;

  const validated = validateKonzultace(b);
  if (!validated.ok) {
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "validation",
      processed: false,
      note: validated.error,
      payload: b,
    });
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400, headers: corsHeaders(req.headers.get("origin")) });
  }

  const { name, email, phone, message, dateIso, time } = validated.data;

  if (!isValidSlot(dateIso, time)) {
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "validation",
      processed: false,
      note: "invalid_slot",
      payload: b,
    });
    return NextResponse.json({ ok: false, error: "Tento termín už není k dispozici. Vyber jiný." }, { status: 400, headers: corsHeaders(req.headers.get("origin")) });
  }
  if (await isSlotBooked(dateIso, time)) {
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "validation",
      processed: false,
      note: "slot_booked",
      payload: b,
    });
    return NextResponse.json({ ok: false, error: "Tento termín už není k dispozici. Vyber jiný." }, { status: 409, headers: corsHeaders(req.headers.get("origin")) });
  }

  const meetUrl = process.env.NIA_GOOGLE_MEET_URL?.trim();
  if (!meetUrl) {
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "config",
      processed: false,
      note: "meet_url_missing",
      payload: b,
    });
    return NextResponse.json(
      { ok: false, error: "Rezervace je dočasně nedostupná. Napiš na niadobysar@gmail.com." },
      { status: 503, headers: corsHeaders(req.headers.get("origin")) },
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
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "validation",
      processed: false,
      note: saved.error || "create_failed",
      payload: b,
    });
    return NextResponse.json({ ok: false, error: saved.error }, { status: 409, headers: corsHeaders(req.headers.get("origin")) });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[nia/konzultace] RESEND_API_KEY missing — booking pending", ref);
    await confirmBooking(ref);
    await logSubmission({
      endpoint: "konzultace-post",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "ok",
      processed: true,
      note: "no_resend_confirmed",
      payload: { ref, name, email, dateIso, time },
    });
    return NextResponse.json({
      ok: true,
      ref,
      meetUrl,
      date: formatDateIso(date),
      time,
      emailSent: false,
    }, { headers: corsHeaders(req.headers.get("origin")) });
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

  if (emailSent) {
    await confirmBooking(ref);
  }

  await logSubmission({
    endpoint: "konzultace-post",
    ip: guard.meta.ip,
    userAgent: guard.meta.userAgent,
    origin: guard.meta.origin,
    referer: guard.meta.referer,
    filter: "ok",
    processed: emailSent,
    note: emailSent ? "confirmed" : "pending_expires_15m",
    payload: { ref, name, email, dateIso, time },
  });

  return NextResponse.json({
    ok: true,
    ref,
    meetUrl,
    date: formatDateIso(date),
    time,
    emailSent,
  }, { headers: corsHeaders(req.headers.get("origin")) });
}
