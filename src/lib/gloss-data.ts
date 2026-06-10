export type GlossProcedure = {
  name: string;
  price: string;
  duration: string;
  description: string;
};

export type GlossField = {
  id: string;
  name: string;
  subtitle: string;
  lead: string;
  image?: string;
  imagePosition?: string;
  artKey: "lash" | "brow" | "cosmo" | "ext";
  procedures: GlossProcedure[];
};

export const glossFields: GlossField[] = [
  {
    id: "lash-lifting",
    name: "Lash Lifting",
    subtitle: "Korejská metoda",
    image: "/images/gloss/lash-lifting.png",
    imagePosition: "center 30%",
    artKey: "lash",
    lead: "Přirozené zvlnění a objem tvých vlastních řas — bez nastavování, s keratinovou výživou.",
    procedures: [
      {
        name: "Korean Lash Lift",
        price: "1 290 Kč",
        duration: "60 min",
        description: "Korejský lifting řas s keratinem pro zvednutí a lesk až na 8 týdnů.",
      },
      {
        name: "Lash Lift & Tint",
        price: "1 490 Kč",
        duration: "75 min",
        description: "Lifting v kombinaci s barvením pro výraznější efekt bez řasenky.",
      },
      {
        name: "Lash Botox Care",
        price: "490 Kč",
        duration: "20 min",
        description: "Regenerační kúra vyživující řasy po liftingu, jako doplněk.",
      },
    ],
  },
  {
    id: "brow-bar",
    name: "Brow Bar",
    subtitle: "Architektura obočí",
    image: "/images/gloss/brow-bar.png",
    imagePosition: "center 22%",
    artKey: "brow",
    lead: "Mapování podle proporcí tváře, laminace a barva pro dokonale tvarované obočí.",
    procedures: [
      {
        name: "Brow Architecture",
        price: "990 Kč",
        duration: "45 min",
        description: "Mapování, tvarování, barva a úprava do ideální linie.",
      },
      {
        name: "Brow Lamination",
        price: "1 190 Kč",
        duration: "60 min",
        description: "Laminace pro plný, učesaný a zvednutý vzhled obočí.",
      },
      {
        name: "Henna Brows",
        price: "790 Kč",
        duration: "40 min",
        description: "Barvení hennou s delší výdrží a efektem vyplnění.",
      },
    ],
  },
  {
    id: "kosmetologie",
    name: "Kosmetologie",
    subtitle: "Dermokosmetika",
    image: "/images/gloss/prodluzovani-ras.png",
    imagePosition: "68% 42%",
    artKey: "cosmo",
    lead: "Vícestupňová ošetření ze světa pro okamžitý glow, hydrataci a sjednocený tón.",
    procedures: [
      {
        name: "Hydra-Glow Facial",
        price: "1 690 Kč",
        duration: "75 min",
        description: "Aqua-peeling a kyselina hyaluronová pro okamžitý glow efekt.",
      },
      {
        name: "BB Glow Treatment",
        price: "1 990 Kč",
        duration: "90 min",
        description: "Korejská semi-permanentní technika sjednocující tón pleti.",
      },
      {
        name: "Carbon Laser Peel",
        price: "1 790 Kč",
        duration: "50 min",
        description: "Hollywood peel — laser pro vyhlazení pórů a rozjasnění.",
      },
      {
        name: "Lymphatic Sculpt",
        price: "1 490 Kč",
        duration: "60 min",
        description: "Buccal sculpt masáž obličeje pro konturu a lymfatický odtok.",
      },
    ],
  },
  {
    id: "prodluzovani-ras",
    name: "Prodlužování řas",
    subtitle: "Lash extensions",
    image: "/images/gloss/kosmetologie.png",
    imagePosition: "center 38%",
    artKey: "ext",
    lead: "Ručně tvořené řasy od přirozeného po dramatický objem — lehké a precizní.",
    procedures: [
      {
        name: "Classic Lash Set",
        price: "1 290 Kč",
        duration: "90 min",
        description: "Jedna řasa na řasu pro jemné prodloužení a definici.",
      },
      {
        name: "Volume Lash Set",
        price: "1 890 Kč",
        duration: "120 min",
        description: "Ručně tvořené vějičky — russian volume pro plný objem.",
      },
      {
        name: "Mega Volume",
        price: "2 290 Kč",
        duration: "140 min",
        description: "Maximální dramatický objem pro výrazný pohled.",
      },
      {
        name: "Doplnění (refill)",
        price: "od 690 Kč",
        duration: "60 min",
        description: "Doplnění řas po 2–3 týdnech pro udržení efektu.",
      },
    ],
  },
];

/** Fotky klientů ve vlnitých zrcadlech — soubory do public/images/gloss/clients/ */
export const glossClientPhotos = [
  { src: "/images/gloss/clients/client-1.jpg", alt: "GLOSS — Korean lash lift", objectPosition: "center 42%" },
  { src: "/images/gloss/clients/client-2.png", alt: "GLOSS — brow bar & barva", objectPosition: "center 38%" },
  { src: "/images/gloss/clients/client-3.jpg", alt: "GLOSS — hydrafacial", objectPosition: "center 45%" },
  { src: "/images/gloss/clients/client-4.jpg", alt: "GLOSS — classic lashes", objectPosition: "center 40%" },
  { src: "/images/gloss/clients/client-5.jpg", alt: "GLOSS — foxy lashes", objectPosition: "center 42%" },
  { src: "/images/gloss/clients/client-6.jpg", alt: "GLOSS — angel eyes volume", objectPosition: "center 40%" },
] as const;

export type LashStyleId = "classic" | "volume" | "mega";
export type LashLengthId = "natural" | "medium" | "dramatic";
export type FullGlamLashMode = "lift" | "extensions";
export type BrowToneId = "light" | "medium" | "dark";

export const browTones: { id: BrowToneId; label: string }[] = [
  { id: "light", label: "Světle hnědá" },
  { id: "medium", label: "Středně hnědá" },
  { id: "dark", label: "Tmavě hnědá" },
];

export type GlossLook = {
  id: string;
  label: string;
  desc: string;
  fieldId: string;
  procedure: string;
  badge: string;
};

export const lashExtensionStyles: { id: LashStyleId; label: string; hint: string }[] = [
  { id: "classic", label: "Classic", hint: "1:1 přirozený objem" },
  { id: "volume", label: "Volume", hint: "Jemné vějíře" },
  { id: "mega", label: "Mega", hint: "Plný glam objem" },
];

export const lashLengths: { id: LashLengthId; label: string; mm: number }[] = [
  { id: "natural", label: "Natural", mm: 10 },
  { id: "medium", label: "Medium", mm: 12 },
  { id: "dramatic", label: "Dramatic", mm: 14 },
];

/** Gloss Lab — procedury v AR zrcadle */
export const glossLooks: GlossLook[] = [
  {
    id: "lash-lift",
    label: "Lash lifting",
    desc: "Zvednuté a zatočené vlastní řasy",
    fieldId: "lash-lifting",
    procedure: "Korean Lash Lift",
    badge: "Lift Queen",
  },
  {
    id: "lash-ext",
    label: "Prodlužování řas",
    desc: "Vyber styl a délku — řasy na oku",
    fieldId: "prodluzovani-ras",
    procedure: "Classic Lash Set",
    badge: "Lash Icon",
  },
  {
    id: "brow",
    label: "Brow lamination",
    desc: "Vyčesané a lesklé obočí",
    fieldId: "brow-bar",
    procedure: "Brow Lamination",
    badge: "Arch Master",
  },
  {
    id: "skin",
    label: "Facial glow",
    desc: "Rozzářená a vyretušovaná pleť",
    fieldId: "kosmetologie",
    procedure: "Hydra-Glow Facial",
    badge: "Glow Keeper",
  },
  {
    id: "full-glam",
    label: "Vše naráz",
    desc: "Obočí + pleť + řasy — lash lift nebo prodlužování",
    fieldId: "lash-lifting",
    procedure: "Gloss Full Look",
    badge: "Total Gloss",
  },
];

/** @deprecated alias */
export const glossMoods = glossLooks;
export type GlossMood = GlossLook;

export function buildGlossEffectConfig(
  lookId: string,
  intensity: number,
  lashStyle: LashStyleId,
  lashLength: LashLengthId,
  fullGlamLash: FullGlamLashMode,
  browTone: BrowToneId,
) {
  const base = {
    skin: false,
    brow: false,
    lashLift: false,
    lashExtensions: false,
    lashStyle,
    lashLength,
    browTone,
    intensity,
  };

  switch (lookId) {
    case "lash-lift":
      return { ...base, lashLift: true };
    case "lash-ext":
      return { ...base, lashExtensions: true };
    case "brow":
      return { ...base, brow: true };
    case "skin":
      return { ...base, skin: true };
    case "full-glam":
      return {
        ...base,
        skin: true,
        brow: true,
        lashLift: fullGlamLash === "lift",
        lashExtensions: fullGlamLash === "extensions",
      };
    default:
      return base;
  }
}

export const glossMarqueeItems = [
  "Lash Lifting",
  "Brow Bar",
  "Kosmetologie",
  "Prodlužování řas",
  "Glow & Glitter",
] as const;

export const glossContact = {
  address: "Růžová 7, Praha 1",
  addressNote: "2. patro, výtah do atelieru",
  phone: "+420 777 123 456",
  phoneNote: "volej nebo piš na WhatsApp",
  email: "ahoj@gloss-atelier.cz",
  emailNote: "odpovídáme do pár hodin",
  hours: "Út–Ne 9:00–19:00",
  hoursNote: "pondělí zavřeno",
} as const;

export const glossTimeSlots = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
] as const;

export const allGlossProcedures = glossFields.flatMap((f) =>
  f.procedures.map((p) => ({ ...p, field: f.name })),
);
