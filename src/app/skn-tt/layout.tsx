import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("skn-tt")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/skn-tt", label: "Úvod" },
        { href: "/skn-tt/sluzby", label: "Nabídka" },
        { href: "/skn-tt/portfolio", label: "Portfolio" },
        { href: "/skn-tt/rezervace", label: "Walk-in info" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
