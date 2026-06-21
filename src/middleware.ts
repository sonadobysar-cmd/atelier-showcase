import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Kořen domény → cesta v atelier-showcase (bez koncového /) */
const SUBDOMAIN_TO_PATH: Record<string, string> = {
  gloss: "/gloss",
  void: "/atelier-void",
  "atelier-void": "/atelier-void",
  lume: "/lume",
  klinika: "/lume",
  laleia: "/laleia",
  matcha: "/matcha",
  realty: "/klic-estate",
  realitka: "/klic-estate",
  "klic-estate": "/klic-estate",
  bdy: "/bdy-to-bdy",
  "bdy-to-bdy": "/bdy-to-bdy",
  funnel: "/masterclass",
  masterclass: "/masterclass",
  webinar: "/masterclass",
  vini: "/vini-d-elite",
  "vini-d-elite": "/vini-d-elite",
  vinidelite: "/vini-d-elite",
  portfolio: "/nia/projekty",
  projekty: "/nia/projekty",
};

const ROOT_HOSTS = new Set([
  "niadobysar.cz",
  "www.niadobysar.cz",
  "atelier-showcase-cyan.vercel.app",
]);

const NIA_HOSTS = new Set(["nia.niadobysar.cz", "www.nia.niadobysar.cz"]);

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

export function middleware(request: NextRequest) {
  const host = getHost(request);
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
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

  const parts = host.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    const dest = SUBDOMAIN_TO_PATH[sub];
    if (dest) {
      if (pathname === "/" || pathname === "") {
        return rewriteTo(request.nextUrl, `${dest}/index.html`);
      }
      if (pathname.startsWith(dest)) {
        return NextResponse.next();
      }
      const suffix = pathname.endsWith("/") ? "index.html" : pathname.includes(".") ? pathname.slice(dest.length) : `${pathname}/index.html`;
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
