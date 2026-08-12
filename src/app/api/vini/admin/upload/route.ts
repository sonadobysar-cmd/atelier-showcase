import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readAdminSession, validCsrf } from "@/lib/vini/admin-auth";
import { clientIp, limit, noStoreHeaders, sameOrigin } from "@/lib/vini/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders() });
}

function detect(bytes: Uint8Array): { type: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return { type: "image/png", ext: "png" };
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return { type: "image/webp", ext: "webp" };
  return null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return response({ ok: false, error: "Požadavek nebyl povolen." }, 403);
  const session = readAdminSession(request);
  if (!session) return response({ ok: false, error: "Přihlaste se znovu." }, 401);
  if (!validCsrf(request, session)) return response({ ok: false, error: "Bezpečnostní token vypršel. Obnovte stránku." }, 403);
  const allowed = await limit(`admin-upload:${session.email}:${clientIp(request)}`, 20, 3600);
  if (!allowed.ok) return NextResponse.json({ ok: false, error: "Příliš mnoho nahrávání." }, { status: 429, headers: noStoreHeaders({ "Retry-After": String(allowed.retryAfter) }) });
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 512_000) return response({ ok: false, error: "Fotografie může mít nejvýše 8 MB." }, 413);
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) return response({ ok: false, error: "Úložiště fotografií zatím není nakonfigurováno." }, 503);
  let form: FormData;
  try { form = await request.formData(); } catch { return response({ ok: false, error: "Soubor se nepodařilo načíst." }, 400); }
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > MAX_BYTES) return response({ ok: false, error: "Vyberte fotografii JPG, PNG nebo WebP do 8 MB." }, 400);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detect(bytes);
  if (!format) return response({ ok: false, error: "Povolené jsou pouze ověřené obrázky JPG, PNG a WebP." }, 415);
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(`vini-cms/images/${Date.now()}-${randomUUID()}.${format.ext}`, Buffer.from(bytes), { access: "public", addRandomSuffix: false, contentType: format.type, cacheControlMaxAge: 31536000 });
    return response({ ok: true, url: blob.url });
  } catch (error) {
    console.error("[vini/admin/upload]", error);
    return response({ ok: false, error: "Fotografii se nepodařilo bezpečně uložit." }, 502);
  }
}
