"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { Brand } from "@/lib/brands";

const nav = [
  { href: "/eliza-clinic#o-nas", label: "O nás" },
  { href: "/eliza-clinic/sluzby", label: "Služby" },
  { href: "/eliza-clinic", label: "Úvod" },
  { href: "/eliza-clinic/rezervace", label: "Rezervace" },
  { href: "/eliza-clinic#kontakt", label: "Více" },
] as const;

function Nav({ variant }: { variant: "hero" | "inner" }) {
  const cls = variant === "hero" ? "eliza-nav eliza-nav--hero" : "eliza-nav eliza-nav--inner";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12 lg:gap-x-16">
      {nav.map((item) => (
        <Link key={item.href} href={item.href} className={`${cls} transition`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function ElizaHomeNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-6 pt-9 sm:px-10 sm:pt-10">
      <Nav variant="hero" />
    </header>
  );
}

export function ElizaShell({ brand, children }: { brand: Brand; children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/eliza-clinic";

  return (
    <div className="eliza-site" style={{ "--eliza-accent": brand.accent } as CSSProperties}>
      {!isHome && (
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white px-6 py-5 sm:px-10">
          <Nav variant="inner" />
        </header>
      )}
      <main>{children}</main>
      {!isHome && (
        <footer className="border-t border-black/8 px-4 py-6 text-center">
          <Link href="/" className="eliza-nav eliza-nav--inner text-[10px] opacity-40">
            ← Portfolio demo
          </Link>
        </footer>
      )}
    </div>
  );
}
