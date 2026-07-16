import { randomBytes, randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ShopOrder } from "@/lib/nia/shop-orders-types";

export type { ShopOrder } from "@/lib/nia/shop-orders-types";

const BLOB_PATH = "nia-shop/orders.json";
const DATA_DIR = process.env.NIA_SHOP_ORDERS_DATA_DIR || path.join(process.cwd(), "data", "nia-shop");
const DATA_FILE = path.join(DATA_DIR, "orders.json");

function usesBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function readAll(): Promise<ShopOrder[]> {
  if (usesBlobStore()) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(BLOB_PATH, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) return [];
      const raw = await new Response(result.stream).text();
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as ShopOrder[]) : [];
    } catch {
      return [];
    }
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ShopOrder[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(orders: ShopOrder[]) {
  const payload = JSON.stringify(orders, null, 2);
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

export function newDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createPendingOrder(input: {
  productId: string;
  productName: string;
  productType: "template" | "stock";
  amountCzk: number;
  stripeSessionId: string;
  customerEmail?: string;
}): Promise<ShopOrder> {
  const orders = await readAll();
  const order: ShopOrder = {
    id: randomUUID(),
    productId: input.productId,
    productName: input.productName,
    productType: input.productType,
    customerEmail: input.customerEmail || "",
    amountCzk: input.amountCzk,
    stripeSessionId: input.stripeSessionId,
    status: "pending",
    downloadToken: newDownloadToken(),
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await writeAll(orders);
  return order;
}

export async function findOrderBySessionId(sessionId: string): Promise<ShopOrder | null> {
  const orders = await readAll();
  return orders.find((o) => o.stripeSessionId === sessionId) || null;
}

export async function findOrderByDownloadToken(token: string): Promise<ShopOrder | null> {
  const orders = await readAll();
  return orders.find((o) => o.downloadToken === token && o.status === "paid") || null;
}

export async function updateOrder(id: string, patch: Partial<ShopOrder>): Promise<ShopOrder | null> {
  const orders = await readAll();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...patch };
  await writeAll(orders);
  return orders[idx];
}

export function siteBaseUrl(): string {
  const raw = process.env.NIA_SITE_URL?.trim() || "https://www.niadobysar.com";
  return raw.replace(/\/$/, "");
}

export function downloadUrl(token: string): string {
  return `${siteBaseUrl()}/api/nia/shop/download?token=${encodeURIComponent(token)}`;
}
