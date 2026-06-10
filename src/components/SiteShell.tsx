import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Brand } from "@/lib/brands";

type NavItem = { href: string; label: string };

export function SiteShell({
  brand,
  nav,
  children,
}: {
  brand: Brand;
  nav: NavItem[];
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen font-sans"
      style={
        {
          "--brand-accent": brand.accent,
          "--brand-accent-muted": brand.accentMuted,
          "--brand-surface": brand.surface,
          "--brand-text": brand.text,
          backgroundColor: brand.surface,
          color: brand.text,
        } as CSSProperties
      }
    >
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--brand-surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={`/${brand.slug}`} className="group">
            <span className="font-display text-lg tracking-tight sm:text-xl">{brand.name}</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] opacity-50">
              {brand.city}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="opacity-70 transition hover:opacity-100"
                style={{ color: "var(--brand-text)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest opacity-40 transition hover:opacity-70"
          >
            ← Portfolio
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-black/5 px-4 py-10 text-center text-sm opacity-50">
        <p>
          {brand.name} · fiktivní značka · demo web
        </p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} — pouze prezentační účely</p>
      </footer>
    </div>
  );
}
