import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("revolution-of-beauty")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/revolution-of-beauty", label: "Úvod" },
        { href: "/revolution-of-beauty/sluzby", label: "PMU" },
        { href: "/revolution-of-beauty/academy", label: "Academy" },
        { href: "/revolution-of-beauty/obchod", label: "E-shop" },
        { href: "/revolution-of-beauty/rezervace", label: "Rezervace" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
