import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/nia/cms-catalog";
import { corsHeaders, validateBrowserOrigin } from "@/lib/nia/security/allowed-origins";
import { absoluteImageUrl, fulfillPaidOrder } from "@/lib/nia/shop-fulfill";
import { productPurchasable } from "@/lib/nia/shop-product";
import { createPendingOrder, siteBaseUrl } from "@/lib/nia/shop-orders";
import { czkToStripeAmount, getStripe } from "@/lib/nia/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!validateBrowserOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." }, { status: 403 });
  }

  if (!getStripe()) {
    return NextResponse.json({ ok: false, error: "Platby nejsou zatím aktivní." }, { status: 503 });
  }

  const stripe = getStripe()!;

  let body: { productId?: string; email?: string };
  try {
    body = (await req.json()) as { productId?: string; email?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatná data." }, { status: 400 });
  }

  const productId = String(body.productId || "").trim();
  if (!productId) {
    return NextResponse.json({ ok: false, error: "Chybí produkt." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.id === productId);
  if (!product || !productPurchasable(product)) {
    return NextResponse.json({ ok: false, error: "Produkt není k prodeji." }, { status: 400 });
  }

  const base = siteBaseUrl();
  const customerEmail = String(body.email || "").trim() || undefined;
  const image = absoluteImageUrl(product.imageUrl);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "czk",
          unit_amount: czkToStripeAmount(product.priceCzk!),
          product_data: {
            name: product.name,
            description: product.description || product.priceLabel || undefined,
            images: image ? [image] : undefined,
          },
        },
      },
    ],
    metadata: {
      productId: product.id,
      productName: product.name,
      productType: product.type,
    },
    success_url: `${base}/nia/dekujeme-obchod?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/nia/obchod`,
  });

  if (!session.url) {
    return NextResponse.json({ ok: false, error: "Stripe session bez URL." }, { status: 500 });
  }

  await createPendingOrder({
    productId: product.id,
    productName: product.name,
    productType: product.type,
    amountCzk: product.priceCzk!,
    stripeSessionId: session.id,
    customerEmail,
  });

  return NextResponse.json({ ok: true, url: session.url });
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
