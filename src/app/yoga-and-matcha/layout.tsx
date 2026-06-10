import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("yoga-and-matcha")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/yoga-and-matcha", label: "Úvod" },
        { href: "/yoga-and-matcha/nabidka", label: "Nabídka" },
        { href: "/yoga-and-matcha/rozvrh", label: "Rozvrh" },
        { href: "/yoga-and-matcha/rezervace", label: "Rezervace" },
        { href: "/yoga-and-matcha/galerie", label: "Studio" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
