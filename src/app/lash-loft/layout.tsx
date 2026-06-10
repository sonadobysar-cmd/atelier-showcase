import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("lash-loft")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/lash-loft", label: "Úvod" },
        { href: "/lash-loft/sluzby", label: "Služby" },
        { href: "/lash-loft/galerie", label: "Galerie" },
        { href: "/lash-loft/rezervace", label: "Rezervace" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
