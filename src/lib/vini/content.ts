import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const CONTENT_PATH = "vini-cms/content.json";
const DATA_DIR = process.env.VINI_CMS_DATA_DIR || path.join(process.cwd(), ".data", "vini-cms");
const DATA_FILE = path.join(DATA_DIR, "content.json");

export const VINI_TEXT_KEYS = [
  "home.finderIntro",
  "home.collectionIntro",
  "home.wineriesIntro",
  "home.regionsIntro",
  "home.aboutTitle",
  "home.aboutLead",
  "b2b.heroTitle",
  "b2b.heroLead",
  "b2b.contactLead",
  "prive.membershipIntro",
  "prive.joinLead",
] as const;

export const VINI_IMAGE_KEYS = [
  "home.founder", "b2b.hero", "prive.founder",
  "wine.1", "wine.2", "wine.3", "wine.4", "wine.5", "wine.6",
  "wine.7", "wine.8", "wine.9", "wine.12", "wine.13", "wine.14",
] as const;
export const VINI_LEGAL_KEYS = ["gdpr", "terms", "cookies", "complaints", "shipping"] as const;

export type ViniTextKey = (typeof VINI_TEXT_KEYS)[number];
export type ViniImageKey = (typeof VINI_IMAGE_KEYS)[number];
export type ViniLegalKey = (typeof VINI_LEGAL_KEYS)[number];

export type ViniContent = {
  version: 1;
  updatedAt: string;
  texts: Record<ViniTextKey, string>;
  images: Record<ViniImageKey, string>;
  legal: Record<ViniLegalKey, string>;
};

export function defaultViniContent(): ViniContent {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    texts: {
      "home.finderIntro": "Pět rychlých otázek propojí vaši chuť, příležitost a jídlo s profilem každé lahve. Pro jemnější výběr vám osobně poradí Michal.",
      "home.collectionIntro": "Vybrané lahve v malých šaržích. Dostupnost ověřím osobně a doporučím nejlepší shodu pro váš stůl i příležitost.",
      "home.wineriesIntro": "Cílem Vini d’Elite jsou čtyři výjimečná rodinná vinařství. Každé zde dostane vlastní příběh a kolekci až ve chvíli, kdy projde osobním výběrem.",
      "home.regionsIntro": "Piemonte, Toscana a Sicilia. Ve třech výrazných oblastech hledáme rodinná vinařství s charakterem, která se do Česka dosud běžně nedovážejí.",
      "home.aboutTitle": "Osobní výběr. *Skutečný příběh.*",
      "home.aboutLead": "Zapomeňte na anonymní regály a tuctové e-shopy. Vini d’Elite vzniklo z lásky k místům, kde se víno nedělá v továrnách, ale rukama rodin.",
      "b2b.heroTitle": "Víno, které *reprezentuje* vaši firmu",
      "b2b.heroLead": "Zapomeňte na neosobní reklamní předměty. Pro klienty, tým i výjimečný večer sestavíme osobní výběr italských vín podle příležitosti, rozpočtu a lidí, kterým má udělat radost — vždy s konkrétním původem a příběhem.",
      "b2b.contactLead": "Stačí základní představa. Michal se vám ozve osobně a připraví výběr, který bude odpovídat vašemu zadání i aktuální dostupnosti.",
      "prive.membershipIntro": "Registrace je nezávazná. Po osobním přijetí funguje členství jako klubový kredit 300 Kč měsíčně — celá částka se vám vrací při výběru vína, degustačního setu nebo klubové akce.",
      "prive.joinLead": "Privé d’Elite je pro ty, kteří chtějí víno objevovat osobně, v malých šaržích a se skutečným příběhem.",
    },
    images: {
      "home.founder": "/images/zakladatel-home.png",
      "b2b.hero": "/images/degustacni-set-hero.png",
      "prive.founder": "/images/club/club-zakladatel.webp",
      "wine.1": "/images/wines/san-lorenzo.webp",
      "wine.2": "/images/wines/la-cappelletta.webp",
      "wine.3": "/images/wines/barbera-dasti.webp",
      "wine.4": "/images/wines/grignolino.webp",
      "wine.5": "/images/wines/dolcetto.webp",
      "wine.6": "/images/wines/freisa-dasti.webp",
      "wine.7": "/images/wines/cisterna-dasti.webp",
      "wine.8": "/images/wines/bric-du-sivu.webp",
      "wine.9": "/images/wines/mini-fior.webp",
      "wine.12": "/images/wines/bonarda.webp",
      "wine.13": "/images/wines/sant-antonio.webp",
      "wine.14": "/images/wines/santa-dorotea.webp",
    },
    legal: {
      gdpr: "Správcem osobních údajů je Vini d’Elite se sídlem v Brně. Kontakt: info@vinidelite.cz, +420 733 356 030.\n\n## Jaké údaje zpracováváme\nJméno, e-mail a telefon pouze v rozsahu potřebném pro vyřízení dotazu, poptávky nebo objednávky.\n\n## Práva subjektu údajů\nMáte právo na přístup, opravu, výmaz, omezení zpracování a přenositelnost údajů. Stížnost lze podat u ÚOOÚ.",
      terms: "Obchodní podmínky Vini d’Elite upravují individuálně potvrzené objednávky a poptávky vín.\n\n## Identifikace prodávajícího\nVini d’Elite · Brno, Česká republika · info@vinidelite.cz · +420 733 356 030\n\n## Objednávka a uzavření smlouvy\nPoptávka odeslaná z webu není automatickou objednávkou. Konkrétní dostupnost, cenu, dopravu a uzavření smlouvy potvrdíme individuálně.\n\n## Odstoupení a reklamace\nPráva spotřebitele se řídí platnými právními předpisy České republiky. Finální znění dokumentu před publikací ověřte s právníkem.",
      cookies: "Web Vini d’Elite používá nezbytné cookies pro základní fungování a zapamatování vašeho nastavení souhlasu.\n\n## Nezbytné cookies\nUmožňují bezpečné fungování webu a administračního přihlášení. Nelze je vypnout bez omezení funkčnosti.\n\n## Analytické cookies\nPoužijeme je pouze po vašem souhlasu, pokud budou na web později doplněny.\n\n## Správa souhlasu\nSouhlas můžete změnit vymazáním uloženého nastavení v prohlížeči nebo kontaktováním info@vinidelite.cz.",
      complaints: "Reklamaci uplatněte prostřednictvím kontaktního formuláře nebo na info@vinidelite.cz. V případě potřeby volejte +420 733 356 030.\n\n## Co uvést\nPopište objednávku a vadu; u poškozené zásilky přiložte fotografie obalu a lahve.\n\n## Vyřízení\nReklamaci vyřídíme v zákonné lhůtě a o výsledku vás budeme informovat. Finální znění dokumentu před publikací ověřte s právníkem.",
      shipping: "Dopravu a osobní předání domlouváme podle konkrétní dostupnosti, množství a místa doručení.\n\n## Doručení\nPřesnou cenu a termín vždy potvrdíme před uzavřením objednávky.\n\n## Osobní odběr\nPo individuální domluvě v Brně — vhodné zejména pro větší objednávky a degustační sety.",
    },
  };
}

function text(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/\u0000/g, "").trim();
  return clean ? clean.slice(0, max) : fallback;
}

function imageUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().slice(0, 1200);
  if (clean.startsWith("/images/") || /^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(clean)) return clean;
  return fallback;
}

export function normalizeViniContent(raw: unknown): ViniContent {
  const base = defaultViniContent();
  if (!raw || typeof raw !== "object") return base;
  const source = raw as Partial<ViniContent>;
  const texts = { ...base.texts };
  const images = { ...base.images };
  const legal = { ...base.legal };
  for (const key of VINI_TEXT_KEYS) texts[key] = text(source.texts?.[key], base.texts[key], 4000);
  for (const key of VINI_IMAGE_KEYS) images[key] = imageUrl(source.images?.[key], base.images[key]);
  for (const key of VINI_LEGAL_KEYS) legal[key] = text(source.legal?.[key], base.legal[key], 30000);
  return { version: 1, updatedAt: text(source.updatedAt, base.updatedAt, 80), texts, images, legal };
}

function usesBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function readViniContent(): Promise<ViniContent> {
  if (usesBlob()) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(CONTENT_PATH, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) return defaultViniContent();
      return normalizeViniContent(JSON.parse(await new Response(result.stream).text()));
    } catch (error) {
      console.error("[vini/cms/read]", error);
      return defaultViniContent();
    }
  }
  try {
    return normalizeViniContent(JSON.parse(await readFile(DATA_FILE, "utf8")));
  } catch {
    return defaultViniContent();
  }
}

export async function writeViniContent(raw: unknown): Promise<ViniContent> {
  const content = normalizeViniContent(raw);
  content.updatedAt = new Date().toISOString();
  const payload = JSON.stringify(content, null, 2);
  if (usesBlob()) {
    const { put } = await import("@vercel/blob");
    await put(CONTENT_PATH, payload, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return content;
  }
  if (process.env.NODE_ENV === "production" && process.env.VINI_LOCAL_TEST_MODE !== "1") throw new Error("VINI_CMS_STORAGE_NOT_CONFIGURED");
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, payload, { encoding: "utf8", mode: 0o600 });
  return content;
}
