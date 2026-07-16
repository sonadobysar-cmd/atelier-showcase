import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { checkCmsAdmin } from "@/lib/nia/cms-auth";
import {
  getCatalog,
  saveCatalog,
  slugifyIndustry,
  uploadCmsFile,
} from "@/lib/nia/cms-catalog";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { uploadShopDownloadFile } from "@/lib/nia/shop-files";
import type { CmsIndustry, CmsProduct, CmsUgcVideo, ProductType } from "@/lib/nia/cms-catalog-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
}

export async function GET(req: Request) {
  if (!checkCmsAdmin(req)) return unauthorized();
  const catalog = await getCatalog();
  return NextResponse.json({ ok: true, catalog });
}

export async function POST(req: Request) {
  if (!checkCmsAdmin(req)) return unauthorized();

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const uploadKind = String(form.get("kind") || "image");
    if (uploadKind === "download") {
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ ok: false, error: "Chybí soubor." }, { status: 400 });
      }
      const uploaded = await uploadShopDownloadFile(file);
      if (!uploaded.ok) {
        return NextResponse.json({ ok: false, error: uploaded.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, url: uploaded.key });
    }

    const kind = uploadKind === "video" ? "video" : "image";
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Chybí soubor." }, { status: 400 });
    }
    const uploaded = await uploadCmsFile(file, kind);
    if (!uploaded.ok) {
      return NextResponse.json({ ok: false, error: uploaded.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, url: uploaded.url });
  }

  const body = (await req.json()) as { action?: string; payload?: Record<string, unknown> };
  const action = body.action || "";
  const payload = body.payload || {};
  const catalog = await getCatalog();
  const now = new Date().toISOString();

  if (action === "add_industry") {
    const label = String(payload.label || "").trim();
    if (!label) return NextResponse.json({ ok: false, error: "Zadej název oboru." }, { status: 400 });
    const id = String(payload.id || slugifyIndustry(label)).trim();
    if (catalog.industries.some((i) => i.id === id)) {
      return NextResponse.json({ ok: false, error: "Obor už existuje." }, { status: 400 });
    }
    catalog.industries.push({ id, label });
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "delete_industry") {
    const id = String(payload.id || "").trim();
    catalog.industries = catalog.industries.filter((i) => i.id !== id);
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "add_product") {
    const type = payload.type as ProductType;
    const name = String(payload.name || "").trim();
    const industryId = String(payload.industryId || "").trim();
    const imageUrl = String(payload.imageUrl || "").trim();
    if (!name || !industryId || !imageUrl || (type !== "template" && type !== "stock")) {
      return NextResponse.json({ ok: false, error: "Vyplň typ, název, obor a mockup." }, { status: 400 });
    }
    const priceCzk = Number(payload.priceCzk);
    const downloadUrl = String(payload.downloadUrl || "").trim() || undefined;
    const product: CmsProduct = {
      id: randomUUID(),
      type,
      name,
      industryId,
      imageUrl,
      description: String(payload.description || "").trim() || undefined,
      priceLabel: String(payload.priceLabel || "").trim() || undefined,
      priceCzk: Number.isFinite(priceCzk) && priceCzk > 0 ? Math.round(priceCzk) : undefined,
      downloadUrl,
      active: payload.active !== false,
      order: catalog.products.length + 1,
      createdAt: now,
    };
    catalog.products.push(product);
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "update_product") {
    const id = String(payload.id || "").trim();
    const idx = catalog.products.findIndex((p) => p.id === id);
    if (idx < 0) return NextResponse.json({ ok: false, error: "Produkt nenalezen." }, { status: 404 });
    const cur = catalog.products[idx];
    const rawPrice = payload.priceCzk !== undefined ? Number(payload.priceCzk) : cur.priceCzk;
    catalog.products[idx] = {
      ...cur,
      name: String(payload.name ?? cur.name).trim(),
      industryId: String(payload.industryId ?? cur.industryId).trim(),
      imageUrl: String(payload.imageUrl ?? cur.imageUrl).trim(),
      description: payload.description !== undefined ? String(payload.description).trim() || undefined : cur.description,
      priceLabel: payload.priceLabel !== undefined ? String(payload.priceLabel).trim() || undefined : cur.priceLabel,
      priceCzk:
        payload.priceCzk !== undefined
          ? typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0
            ? Math.round(rawPrice)
            : undefined
          : cur.priceCzk,
      downloadUrl:
        payload.downloadUrl !== undefined
          ? String(payload.downloadUrl).trim() || undefined
          : cur.downloadUrl,
      active: payload.active !== undefined ? Boolean(payload.active) : cur.active,
      order: Number(payload.order ?? cur.order),
    };
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "delete_product") {
    const id = String(payload.id || "").trim();
    catalog.products = catalog.products.filter((p) => p.id !== id);
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "add_ugc_video") {
    const title = String(payload.title || "").trim();
    const videoUrl = String(payload.videoUrl || "").trim();
    if (!title || !videoUrl) {
      return NextResponse.json({ ok: false, error: "Vyplň název a URL videa." }, { status: 400 });
    }
    const video: CmsUgcVideo = {
      id: randomUUID(),
      title,
      videoUrl,
      posterUrl: String(payload.posterUrl || "").trim() || undefined,
      industryId: String(payload.industryId || "").trim() || undefined,
      active: payload.active !== false,
      order: catalog.ugcVideos.length + 1,
      createdAt: now,
    };
    catalog.ugcVideos.push(video);
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "update_ugc_video") {
    const id = String(payload.id || "").trim();
    const idx = catalog.ugcVideos.findIndex((v) => v.id === id);
    if (idx < 0) return NextResponse.json({ ok: false, error: "Video nenalezeno." }, { status: 404 });
    const cur = catalog.ugcVideos[idx];
    catalog.ugcVideos[idx] = {
      ...cur,
      title: String(payload.title ?? cur.title).trim(),
      videoUrl: String(payload.videoUrl ?? cur.videoUrl).trim(),
      posterUrl: payload.posterUrl !== undefined ? String(payload.posterUrl).trim() || undefined : cur.posterUrl,
      industryId: payload.industryId !== undefined ? String(payload.industryId).trim() || undefined : cur.industryId,
      active: payload.active !== undefined ? Boolean(payload.active) : cur.active,
      order: Number(payload.order ?? cur.order),
    };
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  if (action === "delete_ugc_video") {
    const id = String(payload.id || "").trim();
    catalog.ugcVideos = catalog.ugcVideos.filter((v) => v.id !== id);
    await saveCatalog(catalog);
    return NextResponse.json({ ok: true, catalog });
  }

  return NextResponse.json({ ok: false, error: "Neznámá akce." }, { status: 400 });
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
