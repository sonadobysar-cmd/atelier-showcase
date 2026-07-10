import { NextResponse } from "next/server";
import { validateBrowserOrigin, corsHeaders } from "@/lib/nia/security/allowed-origins";
import { verifyFormToken } from "@/lib/nia/security/form-token";
import { requestMeta } from "@/lib/nia/security/request-meta";
import {
  rateLimitKontakt,
  rateLimitKonzultaceCreate,
  rateLimitKonzultaceRead,
  upstashConfigured,
} from "@/lib/nia/security/rate-limit";
import { logSubmission } from "@/lib/nia/security/submission-log";
import { verifyTurnstile } from "@/lib/nia/security/turnstile";
import { fakeOkResponse, RATE_LIMIT_MESSAGE } from "@/lib/nia/security/validate";

export type GuardEndpoint = "kontakt" | "konzultace-get" | "konzultace-post";

type GuardOptions = {
  endpoint: GuardEndpoint;
  req: Request;
  body?: Record<string, unknown>;
  requireTurnstile?: boolean;
  emailForLimit?: string;
};

function json(data: unknown, status: number, req: Request) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function guardFormRequest(opts: GuardOptions): Promise<
  | { allowed: true; meta: ReturnType<typeof requestMeta> }
  | { allowed: false; response: NextResponse }
> {
  const meta = requestMeta(opts.req);
  const body = opts.body ?? {};
  const endpoint = opts.endpoint;
  const logBase = {
    endpoint,
    ip: meta.ip,
    userAgent: meta.userAgent,
    origin: meta.origin,
    referer: meta.referer,
    payload: body,
  };

  if (opts.requireTurnstile !== false && !upstashConfigured() && process.env.NODE_ENV === "production") {
    await logSubmission({ ...logBase, filter: "config", processed: false, note: "Upstash missing" });
    return {
      allowed: false,
      response: json({ ok: false, error: "Formulář je dočasně nedostupný." }, 503, opts.req),
    };
  }

  if (!validateBrowserOrigin(opts.req)) {
    await logSubmission({ ...logBase, filter: "origin", processed: false });
    return { allowed: false, response: json({ ok: false, error: "Neplatný požadavek." }, 403, opts.req) };
  }

  const hp = typeof body.website === "string" ? body.website.trim() : "";
  if (hp.length > 0) {
    await logSubmission({ ...logBase, filter: "honeypot", processed: false, note: "honeypot filled" });
    return { allowed: false, response: json(fakeOkResponse(), 200, opts.req) };
  }

  if (endpoint !== "konzultace-get") {
    const formToken = body.formToken ?? body.form_token;
    if (!verifyFormToken(formToken)) {
      await logSubmission({ ...logBase, filter: "time_trap", processed: false });
      return { allowed: false, response: json(fakeOkResponse(), 200, opts.req) };
    }
  }

  if (endpoint === "kontakt") {
    const rl = await rateLimitKontakt(meta.ip);
    if (!rl.ok) {
      await logSubmission({ ...logBase, filter: "rate_limit", processed: false, note: "kontakt" });
      return {
        allowed: false,
        response: json({ ok: false, error: RATE_LIMIT_MESSAGE }, 429, opts.req),
      };
    }
  }

  if (endpoint === "konzultace-get") {
    const rl = await rateLimitKonzultaceRead(meta.ip);
    if (!rl.ok) {
      await logSubmission({ ...logBase, filter: "rate_limit", processed: false, note: "konzultace-read" });
      return {
        allowed: false,
        response: json({ ok: false, error: RATE_LIMIT_MESSAGE }, 429, opts.req),
      };
    }
    return { allowed: true, meta };
  }

  if (endpoint === "konzultace-post") {
    const email = opts.emailForLimit || (typeof body.email === "string" ? body.email.trim().toLowerCase() : "");
    const rl = await rateLimitKonzultaceCreate(meta.ip, email || meta.ip);
    if (!rl.ok) {
      await logSubmission({ ...logBase, filter: "rate_limit", processed: false, note: "konzultace-post" });
      return {
        allowed: false,
        response: json({ ok: false, error: RATE_LIMIT_MESSAGE }, 429, opts.req),
      };
    }
  }

  if (opts.requireTurnstile !== false) {
    const token = body.turnstileToken ?? body["cf-turnstile-response"];
    const valid = await verifyTurnstile(token, meta.ip);
    if (!valid) {
      await logSubmission({ ...logBase, filter: "turnstile", processed: false });
      return { allowed: false, response: json({ ok: false, error: "Ověření selhalo. Obnov stránku a zkus znovu." }, 403, opts.req) };
    }
  }

  return { allowed: true, meta };
}

export function handleOptions(req: Request): NextResponse {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      "Access-Control-Max-Age": "86400",
    },
  });
}
