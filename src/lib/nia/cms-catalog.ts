import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { CmsCatalog, CmsIndustry, CmsProduct, CmsProductPublic, CmsUgcVideo, ProductType } from "@/lib/nia/cms-catalog-types";
import { productPurchasable } from "@/lib/nia/shop-product";

export type { CmsCatalog, CmsIndustry, CmsProduct, CmsProductPublic, CmsUgcVideo, ProductType } from "@/lib/nia/cms-catalog-types";

const BLOB_PATH = "nia-cms/catalog.json";
const DATA_DIR = process.env.NIA_CMS_DATA_DIR || path.join(process.cwd(), "data", "nia-cms");
const DATA_FILE = path.join(DATA_DIR, "catalog.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "nia", "obchod", "uploads");

function usesBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function defaultCatalog(): CmsCatalog {
  const industries: CmsIndustry[] = [
    { id: "kadernictvi", label: "Kadeřnictví" },
    { id: "kosmetika", label: "Kosmetika" },
    { id: "fitness", label: "Fitness" },
    { id: "wellness", label: "Wellness" },
    { id: "gastronomie", label: "Gastronomie" },
    { id: "marketing", label: "Marketing" },
    { id: "obecne", label: "Obecné" },
  ];

  const products: CmsProduct[] = [
    {
      id: "tpl-beauty-01",
      type: "template",
      name: "Carousel — BB Glow kurz",
      industryId: "kosmetika",
      imageUrl: "/nia/ugc-promo/img/carousel-beauty.jpg",
      priceLabel: "od 299 Kč",
      priceCzk: 299,
      active: true,
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "tpl-hair-01",
      type: "template",
      name: "Carousel — kadeřnický kurz",
      industryId: "kadernictvi",
      imageUrl: "/nia/ugc-promo/img/carousel-hair.jpg",
      priceLabel: "od 299 Kč",
      priceCzk: 299,
      active: true,
      order: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "tpl-mkt-01",
      type: "template",
      name: "Carousel — digital marketing",
      industryId: "marketing",
      imageUrl: "/nia/ugc-promo/img/carousel-marketing.jpg",
      priceLabel: "od 299 Kč",
      priceCzk: 299,
      active: true,
      order: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: "stock-salon-01",
      type: "stock",
      name: "Sada — salon & wellness",
      industryId: "wellness",
      imageUrl: "/nia/ugc-promo/img/carousel-invest.jpg",
      description: "10 fotek pro start salonu bez vlastního portfolia.",
      priceLabel: "od 490 Kč",
      priceCzk: 490,
      active: true,
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "stock-pet-01",
      type: "stock",
      name: "Sada — služby & péče",
      industryId: "obecne",
      imageUrl: "/nia/ugc-promo/img/carousel-pet.jpg",
      description: "Stock fotky pro lokální služby a e-shopy.",
      priceLabel: "od 390 Kč",
      priceCzk: 390,
      active: true,
      order: 2,
      createdAt: new Date().toISOString(),
    },
  ];

  const ugcVideos: CmsUgcVideo[] = [
    { id: "ugc-01", title: "Coffee · self-care", videoUrl: "/nia/ugc-promo/clips/reel-coffee.mp4", active: true, order: 1, createdAt: new Date().toISOString() },
    { id: "ugc-02", title: "Ze života fotografky", videoUrl: "/nia/ugc-promo/clips/reel-photographer.mp4", active: true, order: 2, createdAt: new Date().toISOString() },
    { id: "ugc-03", title: "Péče o květiny", videoUrl: "/nia/ugc-promo/clips/reel-flowers.mp4", active: true, order: 3, createdAt: new Date().toISOString() },
    { id: "ugc-04", title: "Aesthetic food", videoUrl: "/nia/ugc-promo/clips/reel-pancakes.mp4", active: true, order: 4, createdAt: new Date().toISOString() },
  ];

  return { industries, products, ugcVideos };
}

function normalizeProduct(p: CmsProduct): CmsProduct {
  return {
    ...p,
    priceCzk: typeof p.priceCzk === "number" && p.priceCzk > 0 ? p.priceCzk : undefined,
    downloadUrl: p.downloadUrl?.trim() || undefined,
  };
}

function normalizeCatalog(raw: unknown): CmsCatalog {
  const base = defaultCatalog();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<CmsCatalog>;
  return {
    industries: Array.isArray(o.industries) && o.industries.length ? o.industries : base.industries,
    products: Array.isArray(o.products) ? o.products.map((p) => normalizeProduct(p as CmsProduct)) : base.products,
    ugcVideos: Array.isArray(o.ugcVideos) ? o.ugcVideos : base.ugcVideos,
  };
}

async function readRaw(): Promise<CmsCatalog> {
  if (usesBlobStore()) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(BLOB_PATH, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) return defaultCatalog();
      const text = await new Response(result.stream).text();
      return normalizeCatalog(JSON.parse(text));
    } catch {
      return defaultCatalog();
    }
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const text = await readFile(DATA_FILE, "utf-8");
    return normalizeCatalog(JSON.parse(text));
  } catch {
    const seed = defaultCatalog();
    await writeRaw(seed);
    return seed;
  }
}

async function writeRaw(catalog: CmsCatalog) {
  const payload = JSON.stringify(catalog, null, 2);
  if (usesBlobStore()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, payload, "utf-8");
}

export async function getCatalog(): Promise<CmsCatalog> {
  return readRaw();
}

export async function saveCatalog(catalog: CmsCatalog) {
  await writeRaw(catalog);
}

export function slugifyIndustry(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "obecne";
}

export async function uploadCmsFile(
  file: File,
  kind: "image" | "video",
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const maxMb = kind === "video" ? 80 : 12;
  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, error: `Soubor je příliš velký (max ${maxMb} MB).` };
  }

  const ext = path.extname(file.name || "") || (kind === "video" ? ".mp4" : ".jpg");
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 8) || (kind === "video" ? ".mp4" : ".jpg");
  const name = `${kind}-${Date.now()}-${randomUUID().slice(0, 8)}${safeExt}`;

  if (usesBlobStore()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`nia-cms/${name}`, file, { access: "public", addRandomSuffix: false });
    return { ok: true, url: blob.url };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  const dest = path.join(UPLOAD_DIR, name);
  await writeFile(dest, buf);
  return { ok: true, url: `/nia/obchod/uploads/${name}` };
}

export function publicCatalog(catalog: CmsCatalog): { industries: CmsIndustry[]; products: CmsProductPublic[]; ugcVideos: CmsUgcVideo[] } {
  return {
    industries: catalog.industries,
    products: catalog.products
      .filter((p) => p.active)
      .sort((a, b) => a.order - b.order)
      .map((p) => {
        const { downloadUrl: _d, ...rest } = p;
        return { ...rest, purchasable: productPurchasable(p) };
      }),
    ugcVideos: catalog.ugcVideos.filter((v) => v.active).sort((a, b) => a.order - b.order),
  };
}
