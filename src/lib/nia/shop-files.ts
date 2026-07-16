import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const BLOB_PREFIX = "nia-shop/files/";
const LOCAL_DIR = path.join(process.cwd(), "data", "nia-shop", "files");

function usesBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function isShopFileKey(key: string): boolean {
  return key.startsWith(BLOB_PREFIX) || key.startsWith("local-shop-file:");
}

export async function uploadShopDownloadFile(
  file: File,
): Promise<{ ok: true; key: string } | { ok: false; error: string }> {
  const maxMb = 150;
  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, error: `Soubor je příliš velký (max ${maxMb} MB).` };
  }

  const ext = path.extname(file.name || "") || ".zip";
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 12) || ".zip";
  const name = `download-${Date.now()}-${randomUUID().slice(0, 8)}${safeExt}`;

  if (usesBlobStore()) {
    const { put } = await import("@vercel/blob");
    await put(`${BLOB_PREFIX}${name}`, file, {
      access: "private",
      addRandomSuffix: false,
    });
    return { ok: true, key: `${BLOB_PREFIX}${name}` };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_DIR, name), buf);
  return { ok: true, key: `local-shop-file:${name}` };
}

export async function readShopDownloadFile(
  key: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  if (key.startsWith(BLOB_PREFIX)) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(key, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      const filename = key.slice(key.lastIndexOf("/") + 1);
      return { buffer, filename, contentType: contentTypeForName(filename) };
    } catch {
      return null;
    }
  }

  if (key.startsWith("local-shop-file:")) {
    const name = key.slice("local-shop-file:".length);
    if (!name || name.includes("..") || name.includes("/")) return null;
    try {
      const buffer = await readFile(path.join(LOCAL_DIR, name));
      return { buffer, filename: name, contentType: contentTypeForName(name) };
    } catch {
      return null;
    }
  }

  return null;
}

function contentTypeForName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".zip")) return "application/zip";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
