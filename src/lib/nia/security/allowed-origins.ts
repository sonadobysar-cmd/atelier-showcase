const DEFAULT_ALLOWED = [
  "https://www.niadobysar.com",
  "https://niadobysar.com",
  "https://www.niadobysar.cz",
  "https://niadobysar.cz",
  "https://nia.niadobysar.com",
  "https://www.nia.niadobysar.com",
  "http://127.0.0.1:3010",
  "http://localhost:3010",
];

const ALLOWED_HOSTS = [
  "www.niadobysar.com",
  "niadobysar.com",
  "www.niadobysar.cz",
  "niadobysar.cz",
  "nia.niadobysar.com",
  "www.nia.niadobysar.com",
  "127.0.0.1",
  "localhost",
  "atelier-showcase-cyan.vercel.app",
];

export function allowedOrigins(): string[] {
  const extra = process.env.NIA_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  return [...DEFAULT_ALLOWED, ...extra];
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins().includes(origin);
}

export function isAllowedReferer(referer: string | null): boolean {
  if (!referer) return false;
  try {
    const url = new URL(referer);
    const origin = `${url.protocol}//${url.host}`;
    return isAllowedOrigin(origin);
  } catch {
    return false;
  }
}

function requestHost(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-host");
  const raw = xf?.split(",")[0]?.trim().split(":")[0] ?? req.headers.get("host")?.split(":")[0];
  return raw?.toLowerCase() ?? null;
}

function isAllowedRequestHost(req: Request): boolean {
  const host = requestHost(req);
  if (!host) return false;
  if (ALLOWED_HOSTS.includes(host)) return true;
  const extra = process.env.NIA_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  return extra.some((o) => {
    try {
      return new URL(o).host.toLowerCase() === host;
    } catch {
      return false;
    }
  });
}

function isSameSiteBrowserRequest(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site")?.toLowerCase();
  return site === "same-origin" || site === "same-site";
}

/**
 * Legitimní prohlížeč z vlastní domény:
 * - Sec-Fetch-Site same-origin / same-site (GET často bez Origin)
 * - Origin nebo Referer z povolené domény
 * - Host hlavička odpovídá vlastní doméně (fallback pro same-origin fetch)
 */
export function validateBrowserOrigin(req: Request): boolean {
  if (isSameSiteBrowserRequest(req) && isAllowedRequestHost(req)) {
    return true;
  }

  const origin = req.headers.get("origin");
  if (origin && isAllowedOrigin(origin)) return true;

  const referer = req.headers.get("referer");
  if (isAllowedReferer(referer)) return true;

  if (isAllowedRequestHost(req)) {
    const mode = req.headers.get("sec-fetch-mode")?.toLowerCase();
    if (mode === "cors" || mode === "same-origin" || mode === "navigate") {
      return true;
    }
  }

  return false;
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (origin && isAllowedOrigin(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin",
    };
  }
  return {};
}
