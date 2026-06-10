import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("petra-sladek")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/petra-sladek", label: "Úvod" },
        { href: "/petra-sladek/programy", label: "Programy" },
        { href: "/petra-sladek/rezervace", label: "Úvodní hovor" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
