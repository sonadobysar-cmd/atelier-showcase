export type BrandFeature =
  | "rezervace"
  | "eshop"
  | "galerie"
  | "menu"
  | "portfolio"
  | "rozvrh"
  | "kurzy"
  | "academy";

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  city: string;
  accent: string;
  accentMuted: string;
  surface: string;
  text: string;
  features: BrandFeature[];
  description: string;
  status: "live" | "wip" | "planned" | "awaiting-design";
  /** Doporučené pořadí realizace (1 = první). */
  buildOrder: number;
};

export const brands: Brand[] = [
  {
    slug: "contour-clinic",
    name: "Contour Clinic",
    tagline: "Perfection is our business, confidence is our mission.",
    category: "Estetická klinika",
    city: "Praha",
    accent: "#C4A062",
    accentMuted: "#F0E8E0",
    surface: "#FAF7F2",
    text: "#0D0D0D",
    features: ["rezervace", "galerie"],
    description:
      "Architektura rtů, contouring, botox, Morpheus8, lipolýza a laser — zdravotnická klinika světového formátu.",
    status: "wip",
    buildOrder: 1,
  },
  {
    slug: "gloss",
    name: "GLOSS",
    tagline: "Probuď se krásná, zůstaň IN.",
    category: "Lash & brow atelier",
    city: "Praha",
    accent: "#FF4FA3",
    accentMuted: "#FFD1E6",
    surface: "#FFF6FB",
    text: "#0A0A0A",
    features: ["rezervace", "galerie"],
    description:
      "Lash lifting, brow bar, kosmetologie a prodlužování řas. Atelier de Beauté v centru Prahy.",
    status: "wip",
    buildOrder: 2,
  },
  {
    slug: "hair-factory",
    name: "HairFactory",
    tagline: "Vlasy. Kurzy. Technologie.",
    category: "Kadeřnictví & academy",
    city: "Praha",
    accent: "#1A1A1A",
    accentMuted: "#E8E4DF",
    surface: "#FFFFFF",
    text: "#111111",
    features: ["rezervace", "galerie", "eshop", "kurzy"],
    description:
      "Salonní partner Paul Mitchell®. Autorské střihy a barvy, laminace, Hair Botox, keratin, mikrokeratin a tape-in.",
    status: "planned",
    buildOrder: 3,
  },
  {
    slug: "caffeholic",
    name: "CaffeHolic",
    tagline: "Káva, na které si vystačíš",
    category: "Kavárna",
    city: "Praha",
    accent: "#5C4033",
    accentMuted: "#EDE4D8",
    surface: "#F7F4EE",
    text: "#2A2824",
    features: ["menu", "eshop"],
    description: "Speciality káva, sezónní menu a e-shop s výběrovým pražením.",
    status: "planned",
    buildOrder: 7,
  },
  {
    slug: "revolution-of-beauty",
    name: "Revolution of Beauty",
    tagline: "PMU · Academy · E-shop",
    category: "PMU & academy",
    city: "Praha",
    accent: "#8B7355",
    accentMuted: "#EDE6DC",
    surface: "#FAF8F5",
    text: "#2B2520",
    features: ["rezervace", "eshop", "academy", "galerie"],
    description:
      "PMU techniky, PMU Masters kurzy a e-shop profesionálních pigmentů a přístrojů.",
    status: "planned",
    buildOrder: 4,
  },
  {
    slug: "skn-tt",
    name: "SKN TT",
    tagline: "Fine line · walk-in · piercing",
    category: "Tetovací studio",
    city: "Praha",
    accent: "#E8E0D4",
    accentMuted: "#1C1C1C",
    surface: "#0F0F0F",
    text: "#F5F0EA",
    features: ["portfolio", "rezervace"],
    description:
      "Jemné linky bez objednání, specializace na fine line, piercing a šperky do uší.",
    status: "planned",
    buildOrder: 6,
  },
  {
    slug: "lash-loft",
    name: "Lash Loft",
    tagline: "Řasy & brow bar",
    category: "Lash & brow studio",
    city: "Brno",
    accent: "#C4A4A4",
    accentMuted: "#F5ECEC",
    surface: "#FFF9F9",
    text: "#3D3232",
    features: ["rezervace", "galerie"],
    description:
      "Lash lifting včetně Korean Lash Lift, prodlužování řas, brow bar a laminace obočí.",
    status: "planned",
    buildOrder: 5,
  },
  {
    slug: "petra-sladek",
    name: "Petra Sladek",
    tagline: "Koučink pro život, ne pro prezentaci",
    category: "Life & career coaching",
    city: "online + Praha",
    accent: "#4A6B7C",
    accentMuted: "#E2EBF0",
    surface: "#F8FAFB",
    text: "#1E2A30",
    features: ["rezervace"],
    description: "Osobní a kariérní koučink 1:1 — úvodní hovor zdarma.",
    status: "planned",
    buildOrder: 9,
  },
  {
    slug: "yoga-and-matcha",
    name: "Yoga and Matcha",
    tagline: "Jóga, matcha, retreaty",
    category: "Jóga studio",
    city: "Praha",
    accent: "#7A8B6E",
    accentMuted: "#E8EDE4",
    surface: "#F9FAF7",
    text: "#2A2E28",
    features: ["rozvrh", "rezervace", "galerie", "kurzy"],
    description:
      "Lekce včetně Yoga & Matcha, permanentky, workshopy a víkendové retreat pobyty.",
    status: "planned",
    buildOrder: 8,
  },
];

export function getBrand(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export const brandsByBuildOrder = [...brands].sort((a, b) => a.buildOrder - b.buildOrder);

export const featureLabels: Record<BrandFeature, string> = {
  rezervace: "Rezervace",
  eshop: "E-shop",
  galerie: "Galerie",
  menu: "Menu",
  portfolio: "Portfolio",
  rozvrh: "Rozvrh",
  kurzy: "Kurzy",
  academy: "Academy",
};
