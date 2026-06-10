import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getBrand } from "@/lib/brands";

const brand = getBrand("caffeholic")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      brand={brand}
      nav={[
        { href: "/caffeholic", label: "Úvod" },
        { href: "/caffeholic/menu", label: "Menu" },
        { href: "/caffeholic/obchod", label: "E-shop" },
      ]}
    >
      {children}
    </SiteShell>
  );
}
