import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/nia/cms-catalog";
import { readShopDownloadFile } from "@/lib/nia/shop-files";
import { findOrderByDownloadToken } from "@/lib/nia/shop-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Chybí token." }, { status: 400 });
  }

  const order = await findOrderByDownloadToken(token);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Odkaz není platný nebo platba nebyla dokončena." }, { status: 404 });
  }

  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.id === order.productId);
  const fileKey = product?.downloadUrl;
  if (!fileKey) {
    return NextResponse.json({ ok: false, error: "Soubor produktu není k dispozici." }, { status: 404 });
  }

  const file = await readShopDownloadFile(fileKey);
  if (!file) {
    return NextResponse.json({ ok: false, error: "Soubor se nepodařilo načíst." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
