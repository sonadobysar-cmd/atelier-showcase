import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, createAdminSession, readAdminSession, verifyAdminCredentials, VINI_ADMIN_COOKIE } from "@/lib/vini/admin-auth";
import { clientIp, limit, noStoreHeaders, sameOrigin } from "@/lib/vini/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders() });
}

export async function GET(request: NextRequest) {
  const session = readAdminSession(request);
  return session ? response({ ok: true, email: session.email, csrf: session.csrf }) : response({ ok: false, authenticated: false }, 401);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return response({ ok: false, error: "Požadavek nebyl povolen." }, 403);
  if (!adminConfigured()) return response({ ok: false, error: "Administrace zatím není nakonfigurována." }, 503);
  const allowed = await limit(`admin-login:${clientIp(request)}`, 5, 15 * 60);
  if (!allowed.ok) return NextResponse.json({ ok: false, error: "Příliš mnoho pokusů. Zkuste to později." }, { status: 429, headers: noStoreHeaders({ "Retry-After": String(allowed.retryAfter) }) });
  if (Number(request.headers.get("content-length") || 0) > 4096) return response({ ok: false, error: "Neplatný požadavek." }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return response({ ok: false, error: "Neplatný požadavek." }, 400); }
  if (!verifyAdminCredentials(body.email, body.password)) return response({ ok: false, error: "Nesprávný e-mail nebo heslo." }, 401);
  const session = createAdminSession(String(body.email));
  const result = response({ ok: true, email: String(body.email).trim().toLowerCase(), csrf: session.csrf });
  result.cookies.set(VINI_ADMIN_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", expires: session.expires, priority: "high" });
  return result;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return response({ ok: false, error: "Požadavek nebyl povolen." }, 403);
  const result = response({ ok: true });
  result.cookies.set(VINI_ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0, priority: "high" });
  return result;
}

