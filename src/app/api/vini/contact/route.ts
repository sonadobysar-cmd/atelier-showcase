import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { resendSend, resolveNiaFrom } from "@/lib/nia/resend";
import { clientIp, limit, noStoreHeaders, sameOrigin, verifyFormToken } from "@/lib/vini/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function json(data: unknown, status: number, extra: Record<string, string> = {}) {
  return NextResponse.json(data, { status, headers: noStoreHeaders(extra) });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Požadavek nebyl povolen." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ ok: false, error: "Neplatný požadavek." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 20_000) return json({ ok: false, error: "Zpráva je příliš dlouhá." }, 413);

  const ip = clientIp(request);
  const ipLimit = await limit(`contact:ip:${ip}`, 5, 60 * 60);
  if (!ipLimit.ok) return json({ ok: false, error: "Odesíláte příliš rychle. Zkuste to prosím později." }, 429, { "Retry-After": String(ipLimit.retryAfter) });

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: "Neplatný požadavek." }, 400); }
  if (clean(body.website, 200)) return json({ ok: true }, 200);
  if (!verifyFormToken(body.formToken)) return json({ ok: false, error: "Bezpečnostní ověření formuláře vypršelo. Obnovte stránku a zkuste to znovu." }, 403);
  if (body.consent !== true) return json({ ok: false, error: "Potvrďte prosím souhlas se zpracováním údajů." }, 400);

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 60);
  const topic = clean(body.topic, 160) || "Obecný dotaz";
  const message = clean(body.message, 4000);
  const context = clean(body.context, 300);
  if (name.length < 2) return json({ ok: false, error: "Doplňte prosím své jméno." }, 400);
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(email)) return json({ ok: false, error: "Doplňte platný e-mail." }, 400);
  if (message.length < 8) return json({ ok: false, error: "Napište prosím krátce, s čím vám můžeme pomoci." }, 400);

  const emailKey = createHash("sha256").update(email).digest("hex").slice(0, 24);
  const emailLimit = await limit(`contact:email:${emailKey}`, 3, 60 * 60);
  if (!emailLimit.ok) return json({ ok: false, error: "Z tohoto e-mailu přišlo příliš mnoho zpráv. Zkuste to prosím později." }, 429, { "Retry-After": String(emailLimit.retryAfter) });

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return json({ ok: false, error: "Formulář je právě nedostupný. Zkuste to prosím později." }, 503);
  const lines = [`Téma: ${topic}`, context ? `Kontext: ${context}` : "", `Jméno: ${name}`, `E-mail: ${email}`, phone ? `Telefon: ${phone}` : "", "", message].filter(Boolean);
  const result = await resendSend(apiKey, {
    from: process.env.VINI_EMAIL_FROM || resolveNiaFrom(),
    to: [process.env.VINI_EMAIL_TO || "info@vinidelite.cz"],
    reply_to: email,
    subject: `Vini d’Elite — ${topic}`,
    text: lines.join("\n"),
    html: `<h2>Nová zpráva z Vini d’Elite</h2><p><strong>Téma:</strong> ${esc(topic)}${context ? `<br><strong>Kontext:</strong> ${esc(context)}` : ""}<br><strong>Jméno:</strong> ${esc(name)}<br><strong>E-mail:</strong> ${esc(email)}${phone ? `<br><strong>Telefon:</strong> ${esc(phone)}` : ""}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
  });
  if (!result.ok) {
    console.error("[vini/contact]", result.status, result.body);
    return json({ ok: false, error: "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu." }, 502);
  }
  return json({ ok: true }, 200);
}
