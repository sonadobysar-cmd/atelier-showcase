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

/** POST z prohlížeče musí mít platný Origin nebo Referer z naší domény. */
export function validateBrowserOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) return isAllowedOrigin(origin);
  const referer = req.headers.get("referer");
  return isAllowedReferer(referer);
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
