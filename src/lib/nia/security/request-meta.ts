export type RequestMeta = {
  ip: string;
  userAgent: string;
  origin: string;
  referer: string;
};

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export function requestMeta(req: Request): RequestMeta {
  return {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent")?.trim() || "",
    origin: req.headers.get("origin")?.trim() || "",
    referer: req.headers.get("referer")?.trim() || "",
  };
}
