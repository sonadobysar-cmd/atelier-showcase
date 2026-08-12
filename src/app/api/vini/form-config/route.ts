import { NextResponse } from "next/server";
import { clientIp, limit, mintFormToken, noStoreHeaders, sameOrigin } from "@/lib/vini/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: "Požadavek nebyl povolen." }, { status: 403, headers: noStoreHeaders() });
  const allowed = await limit(`form-config:${clientIp(request)}`, 30, 3600);
  if (!allowed.ok) return NextResponse.json({ ok: false, error: "Příliš mnoho požadavků." }, { status: 429, headers: noStoreHeaders({ "Retry-After": String(allowed.retryAfter) }) });
  const formToken = mintFormToken();
  if (!formToken) return NextResponse.json({ ok: false, error: "Formulář není bezpečně nakonfigurován." }, { status: 503, headers: noStoreHeaders() });
  return NextResponse.json({ ok: true, formToken }, { headers: noStoreHeaders() });
}

