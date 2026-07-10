import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { mintFormToken } from "@/lib/nia/security/form-token";
import { handleOptions } from "@/lib/nia/security/form-guard";
import { turnstileSiteKey } from "@/lib/nia/security/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  const siteKey = turnstileSiteKey();
  const formToken = mintFormToken();
  if (!siteKey || !formToken) {
    return NextResponse.json(
      { ok: false, error: "Formulář není nakonfigurován." },
      { status: 503, headers: corsHeaders(req.headers.get("origin")) },
    );
  }
  return NextResponse.json(
    { ok: true, turnstileSiteKey: siteKey, formToken },
    { headers: { ...corsHeaders(req.headers.get("origin")), "Cache-Control": "no-store" } },
  );
}
