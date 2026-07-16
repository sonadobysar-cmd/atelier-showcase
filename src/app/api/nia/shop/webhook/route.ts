import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/nia/shop-fulfill";
import { findOrderBySessionId } from "@/lib/nia/shop-orders";
import { getStripe } from "@/lib/nia/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ ok: false, error: "Webhook není nakonfigurován." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "Chybí podpis." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.warn("[shop/webhook] signature", err);
    return NextResponse.json({ ok: false, error: "Neplatný podpis." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: true, skipped: "unpaid" });
    }

    const order = await findOrderBySessionId(session.id);
    if (!order) {
      console.warn("[shop/webhook] order not found for session", session.id);
      return NextResponse.json({ ok: true, skipped: "no_order" });
    }

    if (order.status === "paid") {
      return NextResponse.json({ ok: true, skipped: "already_paid" });
    }

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      order.customerEmail ||
      "";

    if (!email) {
      console.warn("[shop/webhook] missing email for session", session.id);
      return NextResponse.json({ ok: false, error: "Chybí e-mail." }, { status: 422 });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    try {
      await fulfillPaidOrder(order, email, paymentIntentId);
    } catch (err) {
      console.error("[shop/webhook] fulfill failed", err);
      return NextResponse.json({ ok: false, error: "Fulfillment selhal." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, received: true });
}
