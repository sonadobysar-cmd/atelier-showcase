import { Bodoni_Moda, Italianno, Jost } from "next/font/google";
import type { ReactNode } from "react";
import { ContourShell } from "@/components/contour/ContourShell";
import { getBrand } from "@/lib/brands";

const sans = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-contour-sans",
});

const serif = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-contour-serif",
});

const script = Italianno({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-contour-script",
});

const brand = getBrand("contour-clinic")!;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sans.variable} ${serif.variable} ${script.variable}`}>
      <ContourShell brand={brand}>{children}</ContourShell>
    </div>
  );
}
