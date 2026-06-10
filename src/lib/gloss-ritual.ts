import { glossLooks, type GlossLook } from "@/lib/gloss-data";
import type { GlossRitualStep } from "@/lib/gloss-diagnostika";
import type { FocusId } from "@/lib/gloss-diagnostika";

export type RitualIngredientId = "lift" | "laminate" | "glow" | "volume";

export type RitualIngredient = {
  id: RitualIngredientId;
  num: string;
  label: string;
  hint: string;
};

export const ritualIngredients: RitualIngredient[] = [
  { id: "lift", num: "01", label: "Lash lifting", hint: "Korean keratin lift" },
  { id: "laminate", num: "02", label: "Brow lamination", hint: "Architektura & lesk" },
  { id: "glow", num: "03", label: "Facial glow", hint: "Hydra rozjasnění" },
  { id: "volume", num: "04", label: "Lash extensions", hint: "Objem na míru" },
];

const stepBank: Record<RitualIngredientId, GlossRitualStep> = {
  lift: { label: "Korean lash lift", detail: "Keratin, zvednutí a natočení" },
  laminate: { label: "Brow laminace", detail: "Mapování, česání a lesk" },
  glow: { label: "Hydra glow", detail: "Hydratace a rozjasnění" },
  volume: { label: "Lash volume set", detail: "Ruční aplikace řas" },
};

const prep: GlossRitualStep = { label: "Příprava", detail: "Odlíčení a konzultace" };
const finish: GlossRitualStep = { label: "Finální lesk", detail: "Péče a aftercare" };

export type RitualResult = {
  look: GlossLook;
  score: number;
  duration: string;
  priceHint: string;
  ritual: GlossRitualStep[];
  viz: FocusId;
  message: string;
};

function pickLook(ids: RitualIngredientId[]): GlossLook {
  const has = (id: RitualIngredientId) => ids.includes(id);
  const count = ids.length;

  if (count >= 3) return glossLooks.find((l) => l.id === "full-glam")!;
  if (has("volume")) return glossLooks.find((l) => l.id === "lash-ext")!;
  if (has("laminate") && !has("lift") && !has("glow") && !has("volume")) {
    return glossLooks.find((l) => l.id === "brow")!;
  }
  if (has("glow") && !has("lift") && !has("laminate") && !has("volume")) {
    return glossLooks.find((l) => l.id === "skin")!;
  }
  if (has("lift") || has("volume")) return glossLooks.find((l) => l.id === "lash-lift")!;
  if (has("laminate")) return glossLooks.find((l) => l.id === "brow")!;
  return glossLooks.find((l) => l.id === "skin")!;
}

function pickViz(ids: RitualIngredientId[]): FocusId {
  if (ids.length >= 3) return "all";
  if (ids.includes("laminate") && ids.length === 1) return "brow";
  if (ids.includes("glow") && ids.length === 1) return "skin";
  return "lash";
}

function estimateMeta(ids: RitualIngredientId[]): { duration: string; priceHint: string } {
  const mins = ids.reduce((sum, id) => {
    if (id === "volume") return sum + 120;
    if (id === "glow") return sum + 75;
    if (id === "laminate") return sum + 55;
    return sum + 60;
  }, 15);

  const duration =
    mins >= 120
      ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ""}`.trim()
      : `${mins} min`;
  const from = ids.includes("volume") ? 1490 : ids.includes("glow") ? 1290 : 990;

  return {
    duration,
    priceHint: ids.length > 1 ? `od ${from} Kč` : `od ${from} Kč`,
  };
}

export function resolveCustomRitual(ids: RitualIngredientId[]): RitualResult | null {
  if (ids.length === 0) return null;

  const lash = ids.includes("volume") ? "volume" : ids.includes("lift") ? "lift" : null;
  const ordered: RitualIngredientId[] = [];
  if (lash) ordered.push(lash);
  if (ids.includes("laminate")) ordered.push("laminate");
  if (ids.includes("glow")) ordered.push("glow");

  const ritual: GlossRitualStep[] = [prep, ...ordered.map((id) => stepBank[id]), finish];
  const look = pickLook(ordered.length ? ordered : ids);
  const meta = estimateMeta(ordered.length ? ordered : ids);
  const score = Math.min(99, 88 + ids.length * 3 + (ids.length >= 3 ? 5 : 0));

  return {
    look,
    score,
    ...meta,
    ritual,
    viz: pickViz(ids),
    message: "Jemně přejeď po zrcadle — odhalíš svůj rituál.",
  };
}

export type MirrorScene = {
  src: string;
  objectPosition: string;
};

/** Fotografie v zrcadle — mění se podle výběru procedur */
export function resolveMirrorScene(ids: RitualIngredientId[]): MirrorScene {
  const idle: MirrorScene = {
    src: "/images/gloss/hero.png",
    objectPosition: "center 18%",
  };

  if (ids.length === 0) return idle;
  if (ids.length >= 2) {
    return { src: "/images/gloss/hero.png", objectPosition: "center 20%" };
  }

  const sole = ids[0]!;
  const scenes: Record<RitualIngredientId, MirrorScene> = {
    lift: { src: "/images/gloss/lash-lifting.png", objectPosition: "center 42%" },
    laminate: { src: "/images/gloss/brow-bar.png", objectPosition: "center 38%" },
    glow: { src: "/images/gloss/kosmetologie.png", objectPosition: "center 45%" },
    volume: { src: "/images/gloss/prodluzovani-ras.png", objectPosition: "center 40%" },
  };

  return scenes[sole] ?? idle;
}

export function normalizeIngredients(ids: RitualIngredientId[]): RitualIngredientId[] {
  const out: RitualIngredientId[] = [];
  for (const id of ids) {
    if (id === "volume" && out.includes("lift")) {
      out.splice(out.indexOf("lift"), 1);
    }
    if (id === "lift" && out.includes("volume")) continue;
    if (!out.includes(id)) out.push(id);
    if (out.length >= 3) break;
  }
  return out;
}
