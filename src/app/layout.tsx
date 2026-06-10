import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Atelier Showcase — demo weby",
    template: "%s · Atelier Showcase",
  },
  description:
    "Prezentace fiktivních značek: estetika, beauty, gastro, koučink. Demo weby bez backendu.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="cs" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
