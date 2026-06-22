import { NextResponse } from "next/server";
import { resendSend, resolveNiaFrom, resolveNiaTo } from "@/lib/nia/resend";

export const runtime = "nodejs";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
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
  if (typeof b.website === "string" && b.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Vyplň jméno." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Vyplň platný e-mail." }, { status: 400 });
  }
  if (message.length < 4) {
    return NextResponse.json({ ok: false, error: "Napiš zprávu." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Formulář není připojený. Napiš na niadobysar@gmail.com." }, { status: 503 });
  }

  const res = await resendSend(apiKey, {
    from: resolveNiaFrom(),
    to: [resolveNiaTo()],
    reply_to: email,
    subject: `Poptávka webu — ${name}`,
    html: `<p><strong>Jméno:</strong> ${esc(name)}<br><strong>E-mail:</strong> ${esc(email)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    text: `Poptávka webu\n\nJméno: ${name}\nE-mail: ${email}\n\n${message}`,
  });

  if (!res.ok) {
    console.error("[nia/kontakt]", res.status, res.body);
    return NextResponse.json({ ok: false, error: "Odeslání selhalo. Zkus e-mail přímo." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
