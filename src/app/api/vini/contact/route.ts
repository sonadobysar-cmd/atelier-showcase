import { NextResponse } from "next/server";
import { resendSend, resolveNiaFrom, resolveNiaTo } from "@/lib/nia/resend";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, number[]>();
const allowedOrigins = new Set([
  "https://www.vinidelite.cz",
  "https://vinidelite.cz",
  "https://vini-d-elite.vercel.app",
  "http://127.0.0.1:8765",
  "http://localhost:8765",
]);

function clean(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function cors(origin: string | null): Record<string, string> {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(req: Request, data: unknown, status: number) {
  return NextResponse.json(data, { status, headers: { ...cors(req.headers.get("origin")), "Cache-Control": "no-store" } });
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: { ...cors(origin), "Access-Control-Max-Age": "86400" } });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) return json(req, { ok: false, error: "Požadavek nebyl povolen." }, 403);

  const ip = clean(req.headers.get("x-forwarded-for")?.split(",")[0], 80) || "unknown";
  if (rateLimited(ip)) return json(req, { ok: false, error: "Odesíláte příliš rychle. Zkuste to prosím za několik minut." }, 429);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json(req, { ok: false, error: "Neplatný požadavek." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return json(req, { ok: false, error: "Formulář je právě nedostupný. Zkuste to prosím později." }, 503);
  if (clean(body.website, 200)) return json(req, { ok: true }, 200);

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 60);
  const topic = clean(body.topic, 160) || "Obecný dotaz";
  const message = clean(body.message, 4000);
  const context = clean(body.context, 300);

  if (name.length < 2) return json(req, { ok: false, error: "Doplňte prosím své jméno." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req, { ok: false, error: "Doplňte platný e-mail." }, 400);
  if (message.length < 8) return json(req, { ok: false, error: "Napište prosím krátce, s čím vám můžeme pomoci." }, 400);

  const lines = [`Téma: ${topic}`, context ? `Kontext: ${context}` : "", `Jméno: ${name}`, `E-mail: ${email}`, phone ? `Telefon: ${phone}` : "", "", message].filter(Boolean);
  const result = await resendSend(apiKey, {
    from: process.env.VINI_EMAIL_FROM || resolveNiaFrom(),
    to: [process.env.VINI_EMAIL_TO || resolveNiaTo()],
    reply_to: email,
    subject: `Vini d’Elite — ${topic}`,
    text: lines.join("\n"),
    html: `<h2>Nová zpráva z Vini d’Elite</h2><p><strong>Téma:</strong> ${esc(topic)}${context ? `<br><strong>Kontext:</strong> ${esc(context)}` : ""}<br><strong>Jméno:</strong> ${esc(name)}<br><strong>E-mail:</strong> ${esc(email)}${phone ? `<br><strong>Telefon:</strong> ${esc(phone)}` : ""}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
  });

  if (!result.ok) {
    console.error("[vini/contact]", result.status, result.body);
    return json(req, { ok: false, error: "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu." }, 502);
  }
  return json(req, { ok: true }, 200);
}
