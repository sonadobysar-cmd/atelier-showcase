import { Archivo, Ballet, Fraunces, Noto_Serif_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBrand } from "@/lib/brands";
import "./gloss.css";

const sans = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-gloss-sans",
});

const serif = Noto_Serif_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-gloss-serif",
});

const logo = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-gloss-logo",
});

const script = Ballet({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-gloss-script",
});

const brand = getBrand("gloss")!;

export const metadata: Metadata = {
  title: "GLOSS — Atelier de Beauté",
  description: brand.description,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`gloss-root ${sans.variable} ${serif.variable} ${logo.variable} ${script.variable}`}
      style={{ fontFamily: "var(--font-gloss-sans), sans-serif" }}
    >
      {children}
    </div>
  );
}
