import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Primární doména portfolia (subdomény → ukázkové weby) */
const PORTFOLIO_DOMAINS = ["niadobysar.com", "niadobysar.cz"] as const;

/** Subdoména → cesta v atelier-showcase (bez koncového /) */
const SUBDOMAIN_TO_PATH: Record<string, string> = {
  gloss: "/gloss",
  void: "/atelier-void",
  "atelier-void": "/atelier-void",
  lume: "/lume",
  klinika: "/lume",
  lashbabes: "/laleia",
  "lash-babes": "/laleia",
  laleia: "/laleia",
  matcha: "/matcha",
  realitka: "/klic-estate",
  "klic-estate": "/klic-estate",
  realty: "/klic-estate",
  bdy: "/bdy-to-bdy",
  "bdy-to-bdy": "/bdy-to-bdy",
  funnel: "/masterclass",
  masterclass: "/masterclass",
  webinar: "/masterclass",
  zakaznici: "/zakaznici",
  vini: "/vini-d-elite",
  "vini-d-elite": "/vini-d-elite",
  vinidelite: "/vini-d-elite",
  portfolio: "/nia/projekty",
  projekty: "/nia/projekty",
};

const ROOT_HOSTS = new Set([
  ...PORTFOLIO_DOMAINS,
  ...PORTFOLIO_DOMAINS.map((d) => `www.${d}`),
  "atelier-showcase-cyan.vercel.app",
]);

const NIA_HOSTS = new Set(
  PORTFOLIO_DOMAINS.flatMap((d) => [`nia.${d}`, `www.nia.${d}`]),
);

function getHost(request: NextRequest): string {
  const xf = request.headers.get("x-forwarded-host");
  if (xf) {
    return xf.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  }
  return request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
}

function isStaticPath(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return /\.(ico|png|jpe?g|gif|webp|svg|woff2?|txt|xml|json|mp4|webm|js|css|html)$/i.test(pathname);
}

function rewriteTo(url: URL, destPath: string): NextResponse {
  const target = new URL(url.toString());
  target.pathname = destPath;
  return NextResponse.rewrite(target);
}

function withSecurityHeaders(response: NextResponse, pathname = ""): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Permissions-Policy", "accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Origin-Agent-Cluster", "?1");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://*.blob.vercel-storage.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "media-src 'self' data: blob: https://*.blob.vercel-storage.com",
      "upgrade-insecure-requests",
    ].join("; "),
  );
  if (pathname === "/admin" || pathname === "/admin.html" || pathname.endsWith("/vini-d-elite/admin.html") || pathname.startsWith("/api/vini/admin")) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

/** Vrátí subdoménu pro gloss.niadobysar.com → "gloss", kořen → null */
function getSubdomain(host: string): string | null {
  for (const domain of PORTFOLIO_DOMAINS) {
    if (host === domain || host === `www.${domain}`) return null;
    const suffix = `.${domain}`;
    if (!host.endsWith(suffix)) continue;
    const sub = host.slice(0, -suffix.length);
    if (!sub || sub.includes(".")) return null;
    return sub;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const host = getHost(request);
  const { pathname } = request.nextUrl;
  const routePath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (host === "vinidelite.cz" || host === "www.vinidelite.cz") {
    if (pathname.startsWith("/api/vini/")) {
      const backend = new URL(request.nextUrl.toString());
      backend.protocol = "https:";
      backend.host = "atelier-showcase-cyan.vercel.app";
      return withSecurityHeaders(NextResponse.rewrite(backend), pathname);
    }
    const aliases: Record<string, string> = {
      "/": "/vini-d-elite/index.html",
      "/obchod": "/vini-d-elite/obchod.html",
      "/vino": "/vini-d-elite/vino.html",
      "/degustacni-set": "/vini-d-elite/degustacni-set.html",
      "/la-cantina": "/vini-d-elite/la-cantina.html",
      "/b2b": "/vini-d-elite/b2b.html",
      "/kontakt": "/vini-d-elite/kontakt.html",
      "/admin": "/vini-d-elite/admin.html",
      "/gdpr": "/vini-d-elite/gdpr.html",
      "/cookies": "/vini-d-elite/cookies.html",
      "/obchodni-podminky": "/vini-d-elite/obchodni-podminky.html",
      "/reklamacni-rad": "/vini-d-elite/reklamacni-rad.html",
      "/doprava": "/vini-d-elite/doprava.html",
      "/robots.txt": "/vini-d-elite/robots.txt",
      "/sitemap.xml": "/vini-d-elite/sitemap.xml",
    };
    const localizedAliases: Record<string, string> = {
      "/en": "/vini-d-elite/index.html", "/it": "/vini-d-elite/index.html",
      "/en/collection": "/vini-d-elite/obchod.html", "/it/collezione": "/vini-d-elite/obchod.html",
      "/en/wine": "/vini-d-elite/vino.html", "/it/vino": "/vini-d-elite/vino.html",
      "/en/tasting-set": "/vini-d-elite/degustacni-set.html", "/it/set-degustazione": "/vini-d-elite/degustacni-set.html",
      "/en/prive": "/vini-d-elite/la-cantina.html", "/it/prive": "/vini-d-elite/la-cantina.html",
      "/en/b2b": "/vini-d-elite/b2b.html", "/it/b2b": "/vini-d-elite/b2b.html",
      "/en/contact": "/vini-d-elite/kontakt.html", "/it/contatti": "/vini-d-elite/kontakt.html",
      "/en/privacy": "/vini-d-elite/gdpr.html", "/it/privacy": "/vini-d-elite/gdpr.html",
      "/en/cookies": "/vini-d-elite/cookies.html", "/it/cookie": "/vini-d-elite/cookies.html",
      "/en/terms": "/vini-d-elite/obchodni-podminky.html", "/it/condizioni": "/vini-d-elite/obchodni-podminky.html",
      "/en/complaints": "/vini-d-elite/reklamacni-rad.html", "/it/reclami": "/vini-d-elite/reklamacni-rad.html",
      "/en/delivery": "/vini-d-elite/doprava.html", "/it/consegna": "/vini-d-elite/doprava.html",
    };
    if (localizedAliases[routePath]) return withSecurityHeaders(rewriteTo(request.nextUrl, localizedAliases[routePath]), pathname);
    const destination = aliases[routePath];
    if (destination) return withSecurityHeaders(rewriteTo(request.nextUrl, destination), pathname);
  }

  if (isStaticPath(pathname)) {
    if ((host === "vinidelite.cz" || host === "www.vinidelite.cz") && pathname.startsWith("/api")) {
      return withSecurityHeaders(NextResponse.next(), pathname);
    }
    if ((host === "vinidelite.cz" || host === "www.vinidelite.cz") && pathname.startsWith("/vini-d-elite/")) {
      return withSecurityHeaders(NextResponse.next(), pathname);
    }
    if ((host === "vinidelite.cz" || host === "www.vinidelite.cz") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const target = new URL(request.nextUrl.toString());
      target.pathname = `/vini-d-elite${pathname}`;
      return withSecurityHeaders(NextResponse.rewrite(target), pathname);
    }
    return NextResponse.next();
  }

  if (NIA_HOSTS.has(host)) {
    if (pathname === "/" || pathname === "") {
      return rewriteTo(request.nextUrl, "/nia/index.html");
    }
    if (pathname.startsWith("/projekty")) {
      return rewriteTo(request.nextUrl, "/nia/projekty/index.html");
    }
    return rewriteTo(request.nextUrl, `/nia${pathname === "/" ? "" : pathname}`);
  }

  if (ROOT_HOSTS.has(host)) {
    if (pathname === "/" || pathname === "") {
      return rewriteTo(request.nextUrl, "/nia/index.html");
    }
    return NextResponse.next();
  }

  const sub = getSubdomain(host);
  if (sub) {
    const dest = SUBDOMAIN_TO_PATH[sub];
    if (dest) {
      if (pathname === "/" || pathname === "") {
        return rewriteTo(request.nextUrl, `${dest}/index.html`);
      }
      if (pathname.startsWith(dest)) {
        return NextResponse.next();
      }
      const suffix = pathname.endsWith("/")
        ? "index.html"
        : pathname.includes(".")
          ? pathname.slice(dest.length)
          : `${pathname}/index.html`;
      const full = pathname.startsWith("/") ? `${dest}${suffix}` : `${dest}/${suffix}`;
      return rewriteTo(request.nextUrl, full);
    }
  }

  if (pathname === "/" || pathname === "") {
    return rewriteTo(request.nextUrl, "/nia/index.html");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
