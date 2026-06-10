import { glossLooks, type GlossLook } from "@/lib/gloss-data";

export type FocusId = "lash" | "brow" | "skin" | "all";
export type VibeId = "natural" | "bold" | "glam";
export type TimeId = "quick" | "ritual" | "best";

export type DiagnostikaAnswers = {
  focus: FocusId | null;
  vibe: VibeId | null;
  time: TimeId | null;
};

export type DiagnostikaQuestion = {
  id: keyof DiagnostikaAnswers;
  title: string;
  subtitle: string;
  options: { id: string; label: string; hint: string }[];
};

export const diagnostikaQuestions: DiagnostikaQuestion[] = [
  {
    id: "focus",
    title: "Co chceš vylepšit?",
    subtitle: "Vyber hlavní prioritu",
    options: [
      { id: "lash", label: "Řasy", hint: "Zvednutí nebo objem" },
      { id: "brow", label: "Obočí", hint: "Tvar a laminace" },
      { id: "skin", label: "Pleť", hint: "Glow a hydratace" },
      { id: "all", label: "Vše naráz", hint: "Full gloss look" },
    ],
  },
  {
    id: "vibe",
    title: "Jaký vibe hledáš?",
    subtitle: "Od přirozeného po dramatický",
    options: [
      { id: "natural", label: "Přirozeně", hint: "Jemný, fresh efekt" },
      { id: "bold", label: "Výrazně", hint: "Viditelný, ale elegantní" },
      { id: "glam", label: "Total glam", hint: "Maximum lesku" },
    ],
  },
  {
    id: "time",
    title: "Kolik času máš?",
    subtitle: "Přizpůsobíme rituál",
    options: [
      { id: "quick", label: "Do 60 min", hint: "Rychlá péče" },
      { id: "ritual", label: "90+ min", hint: "Signature rituál" },
      { id: "best", label: "Neřeším", hint: "Chci nejlepší výsledek" },
    ],
  },
];

export type GlossRitualStep = { label: string; detail: string };

export type DiagnostikaResult = {
  look: GlossLook;
  score: number;
  duration: string;
  priceHint: string;
  ritual: GlossRitualStep[];
  viz: FocusId;
};

function pickLookId(focus: FocusId, vibe: VibeId): string {
  if (focus === "all") return "full-glam";
  if (focus === "brow") return "brow";
  if (focus === "skin") return "skin";
  if (vibe === "glam") return "lash-ext";
  return "lash-lift";
}

const rituals: Record<string, GlossRitualStep[]> = {
  "lash-lift": [
    { label: "Čištění & příprava", detail: "Jemné odlíčení řas" },
    { label: "Korean lift", detail: "Zvednutí a natočení" },
    { label: "Keratin & fixace", detail: "Výživa a lesk na týdny" },
  ],
  "lash-ext": [
    { label: "Konzultace stylu", detail: "Classic, volume nebo mega" },
    { label: "Aplikace řas", detail: "Ruční práce na oku" },
    { label: "Aftercare", detail: "Tipy pro výdrž" },
  ],
  brow: [
    { label: "Mapování tvaru", detail: "Podle proporcí tváře" },
    { label: "Laminace", detail: "Vyčesání a fixace" },
    { label: "Barva & lesk", detail: "Sjednocený finiš" },
  ],
  skin: [
    { label: "Analýza pleti", detail: "Krátká diagnostika" },
    { label: "Hydra ošetření", detail: "Hloubková hydratace" },
    { label: "Glow finiš", detail: "Rozjasnění a ochrana" },
  ],
  "full-glam": [
    { label: "Brow & pleť", detail: "Laminace + glow facial" },
    { label: "Řasy na míru", detail: "Lift nebo prodlužování" },
    { label: "Finální lesk", detail: "Kompletní gloss look" },
  ],
};

const meta: Record<string, { duration: string; priceHint: string; scoreBase: number }> = {
  "lash-lift": { duration: "60 min", priceHint: "od 1 290 Kč", scoreBase: 91 },
  "lash-ext": { duration: "90–140 min", priceHint: "od 1 490 Kč", scoreBase: 94 },
  brow: { duration: "45–60 min", priceHint: "od 990 Kč", scoreBase: 92 },
  skin: { duration: "75 min", priceHint: "od 1 290 Kč", scoreBase: 90 },
  "full-glam": { duration: "120+ min", priceHint: "na míru", scoreBase: 98 },
};

export function resolveDiagnostika(answers: DiagnostikaAnswers): DiagnostikaResult | null {
  if (!answers.focus || !answers.vibe || !answers.time) return null;

  const lookId = pickLookId(answers.focus, answers.vibe);
  const look = glossLooks.find((l) => l.id === lookId) ?? glossLooks[0]!;
  const m = meta[lookId] ?? meta["lash-lift"]!;

  const vibeBoost = answers.vibe === "glam" ? 3 : answers.vibe === "bold" ? 1 : 0;
  const timeBoost = answers.time === "best" ? 2 : answers.time === "ritual" ? 1 : 0;

  return {
    look,
    score: Math.min(99, m.scoreBase + vibeBoost + timeBoost),
    duration: m.duration,
    priceHint: m.priceHint,
    ritual: rituals[lookId] ?? rituals["lash-lift"]!,
    viz: answers.focus === "all" ? "all" : answers.focus,
  };
}
