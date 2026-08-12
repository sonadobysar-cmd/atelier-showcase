import { NextRequest, NextResponse } from "next/server";
import { readAdminSession, validCsrf } from "@/lib/vini/admin-auth";
import { readViniContent, writeViniContent } from "@/lib/vini/content";
import { clientIp, limit, noStoreHeaders, sameOrigin } from "@/lib/vini/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders() });
}

export async function GET(request: NextRequest) {
  const session = readAdminSession(request);
  if (!session) return response({ ok: false, error: "Přihlaste se znovu." }, 401);
  return response({ ok: true, content: await readViniContent(), csrf: session.csrf });
}

export async function PUT(request: NextRequest) {
  if (!sameOrigin(request)) return response({ ok: false, error: "Požadavek nebyl povolen." }, 403);
  const session = readAdminSession(request);
  if (!session) return response({ ok: false, error: "Přihlaste se znovu." }, 401);
  if (!validCsrf(request, session)) return response({ ok: false, error: "Bezpečnostní token vypršel. Obnovte stránku." }, 403);
  const allowed = await limit(`admin-write:${session.email}:${clientIp(request)}`, 40, 3600);
  if (!allowed.ok) return NextResponse.json({ ok: false, error: "Příliš mnoho změn. Zkuste to později." }, { status: 429, headers: noStoreHeaders({ "Retry-After": String(allowed.retryAfter) }) });
  if (Number(request.headers.get("content-length") || 0) > 180_000) return response({ ok: false, error: "Obsah je příliš velký." }, 413);
  let body: unknown;
  try { body = await request.json(); } catch { return response({ ok: false, error: "Neplatná data." }, 400); }
  try {
    const content = await writeViniContent(body);
    return response({ ok: true, content });
  } catch (error) {
    console.error("[vini/admin/content]", error);
    return response({ ok: false, error: "Změny nelze uložit, protože produkční úložiště není nakonfigurováno." }, 503);
  }
}

