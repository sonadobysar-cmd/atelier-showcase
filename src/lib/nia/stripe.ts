import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key === "STRIPE_SECRET_KEY") return null;
  return new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
}

export function stripeConfigured(): boolean {
  return getStripe() !== null && Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** CZK → nejmenší jednotka pro Stripe (haléře). */
export function czkToStripeAmount(priceCzk: number): number {
  return Math.round(priceCzk * 100);
}

export function formatCzk(amount: number): string {
  return `${amount.toLocaleString("cs-CZ")} Kč`;
}
