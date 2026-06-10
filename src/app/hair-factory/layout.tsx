import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("hair-factory")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/hair-factory", label: "Úvod" },
        { href: "/hair-factory/sluzby", label: "Služby" },
        { href: "/hair-factory/kurzy", label: "Kurzy" },
        { href: "/hair-factory/obchod", label: "Paul Mitchell" },
        { href: "/hair-factory/rezervace", label: "Rezervace" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
