import { NextResponse } from "next/server";
import { resendSend, resolveNiaFrom, resolveNiaTo } from "@/lib/nia/resend";
import { guardFormRequest, handleOptions } from "@/lib/nia/security/form-guard";
import { logSubmission } from "@/lib/nia/security/submission-log";
import { validateKontakt } from "@/lib/nia/security/validate";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";

export const runtime = "nodejs";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
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
  const guard = await guardFormRequest({ endpoint: "kontakt", req, body: b });
  if (!guard.allowed) return guard.response;

  const validated = validateKontakt(b);
  if (!validated.ok) {
    await logSubmission({
      endpoint: "kontakt",
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

  const { name, email, message } = validated.data;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    await logSubmission({
      endpoint: "kontakt",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "config",
      processed: false,
      note: "resend_missing",
      payload: b,
    });
    return NextResponse.json(
      { ok: false, error: "Formulář není připojený. Napiš na niadobysar@gmail.com." },
      { status: 503, headers: corsHeaders(req.headers.get("origin")) },
    );
  }

  const res = await resendSend(apiKey, {
    from: resolveNiaFrom(),
    to: [resolveNiaTo()],
    reply_to: email,
    subject: `Poptávka webu — ${name}`,
    html: `<p><strong>Jméno:</strong> ${esc(name)}<br><strong>E-mail:</strong> ${esc(email)}<br><strong>IP:</strong> ${esc(guard.meta.ip)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    text: `Poptávka webu\n\nJméno: ${name}\nE-mail: ${email}\nIP: ${guard.meta.ip}\n\n${message}`,
  });

  if (!res.ok) {
    console.error("[nia/kontakt]", res.status, res.body);
    await logSubmission({
      endpoint: "kontakt",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "validation",
      processed: false,
      note: `email_failed_${res.status}`,
      payload: b,
    });
    return NextResponse.json({ ok: false, error: "Odeslání selhalo. Zkus e-mail přímo." }, { status: 502, headers: corsHeaders(req.headers.get("origin")) });
  }

  await logSubmission({
    endpoint: "kontakt",
    ip: guard.meta.ip,
    userAgent: guard.meta.userAgent,
    origin: guard.meta.origin,
    referer: guard.meta.referer,
    filter: "ok",
    processed: true,
    payload: { name, email, message },
  });

  return NextResponse.json({ ok: true }, { headers: corsHeaders(req.headers.get("origin")) });
}
