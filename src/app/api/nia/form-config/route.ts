import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { mintFormToken } from "@/lib/nia/security/form-token";
import { guardFormRequest, handleOptions } from "@/lib/nia/security/form-guard";
import { logSubmission } from "@/lib/nia/security/submission-log";
import { turnstileSiteKey } from "@/lib/nia/security/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  const guard = await guardFormRequest({
    endpoint: "form-config",
    req,
    requireTurnstile: false,
  });
  if (!guard.allowed) return guard.response;

  const siteKey = turnstileSiteKey();
  const formToken = mintFormToken();
  if (!siteKey || !formToken) {
    await logSubmission({
      endpoint: "form-config",
      ip: guard.meta.ip,
      userAgent: guard.meta.userAgent,
      origin: guard.meta.origin,
      referer: guard.meta.referer,
      filter: "config",
      processed: false,
      note: "missing_turnstile_or_token_secret",
    });
    return NextResponse.json(
      { ok: false, error: "Formulář není nakonfigurován." },
      { status: 503, headers: corsHeaders(req.headers.get("origin")) },
    );
  }

  await logSubmission({
    endpoint: "form-config",
    ip: guard.meta.ip,
    userAgent: guard.meta.userAgent,
    origin: guard.meta.origin,
    referer: guard.meta.referer,
    filter: "ok",
    processed: true,
  });

  return NextResponse.json(
    { ok: true, turnstileSiteKey: siteKey, formToken },
    { headers: { ...corsHeaders(req.headers.get("origin")), "Cache-Control": "no-store" } },
  );
}
