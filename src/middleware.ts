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

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
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

  if (host === "vinidelite.cz" || host === "www.vinidelite.cz") {
    const aliases: Record<string, string> = {
      "/": "/vini-d-elite/index.html",
      "/obchod": "/vini-d-elite/obchod.html",
      "/vino": "/vini-d-elite/vino.html",
      "/degustacni-set": "/vini-d-elite/degustacni-set.html",
      "/la-cantina": "/vini-d-elite/la-cantina.html",
      "/b2b": "/vini-d-elite/b2b.html",
      "/gdpr": "/vini-d-elite/gdpr.html",
      "/cookies": "/vini-d-elite/cookies.html",
      "/obchodni-podminky": "/vini-d-elite/obchodni-podminky.html",
      "/reklamacni-rad": "/vini-d-elite/reklamacni-rad.html",
      "/doprava": "/vini-d-elite/doprava.html",
      "/robots.txt": "/vini-d-elite/robots.txt",
      "/sitemap.xml": "/vini-d-elite/sitemap.xml",
    };
    const destination = aliases[pathname];
    if (destination) return withSecurityHeaders(rewriteTo(request.nextUrl, destination));
  }

  if (isStaticPath(pathname)) {
    if ((host === "vinidelite.cz" || host === "www.vinidelite.cz") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const target = new URL(request.nextUrl.toString());
      target.pathname = `/vini-d-elite${pathname}`;
      return withSecurityHeaders(NextResponse.rewrite(target));
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
