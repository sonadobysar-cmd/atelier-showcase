import { NextResponse } from "next/server";
import { corsHeaders, validateBrowserOrigin } from "@/lib/nia/security/allowed-origins";
import { downloadUrl, findOrderBySessionId } from "@/lib/nia/shop-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!validateBrowserOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." }, { status: 403 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Chybí session." }, { status: 400 });
  }

  const order = await findOrderBySessionId(sessionId);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Objednávka nenalezena." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json({
      ok: true,
      status: order.status,
      productName: order.productName,
      pending: true,
    });
  }

  return NextResponse.json({
    ok: true,
    status: "paid",
    productName: order.productName,
    amountCzk: order.amountCzk,
    downloadUrl: downloadUrl(order.downloadToken),
    invoiceUrl: order.fakturoidInvoiceUrl || undefined,
  });
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
