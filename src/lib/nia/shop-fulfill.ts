import { getCatalog } from "@/lib/nia/cms-catalog";
import { productPurchasable } from "@/lib/nia/shop-product";
import { createInvoiceForOrder } from "@/lib/nia/fakturoid";
import { resendSend, resolveNiaFrom, resolveNiaTo } from "@/lib/nia/resend";
import { downloadUrl, siteBaseUrl, updateOrder } from "@/lib/nia/shop-orders";
import type { ShopOrder } from "@/lib/nia/shop-orders-types";
import { formatCzk } from "@/lib/nia/stripe";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function fulfillPaidOrder(order: ShopOrder, customerEmail: string, paymentIntentId?: string) {
  const paidAt = new Date().toISOString();
  let invoiceUrl = order.fakturoidInvoiceUrl;

  if (!order.fakturoidInvoiceId) {
    const inv = await createInvoiceForOrder({
      customerEmail,
      productName: order.productName,
      amountCzk: order.amountCzk,
      paidOn: paidAt,
    });
    if (inv.ok) {
      invoiceUrl = inv.invoiceUrl;
      await updateOrder(order.id, {
        fakturoidInvoiceId: inv.invoiceId,
        fakturoidInvoiceUrl: inv.invoiceUrl,
      });
    } else {
      console.warn("[shop/fulfill] fakturoid", inv.error);
    }
  }

  await updateOrder(order.id, {
    status: "paid",
    customerEmail,
    paidAt,
    stripePaymentIntentId: paymentIntentId,
  });

  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.id === order.productId);
  const link = downloadUrl(order.downloadToken);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && customerEmail) {
    const invoiceNote = invoiceUrl
      ? `<p>Faktura: <a href="${esc(invoiceUrl)}">${esc(invoiceUrl)}</a></p>`
      : "";

    await resendSend(apiKey, {
      from: resolveNiaFrom(),
      to: [customerEmail],
      subject: `Tvůj nákup — ${order.productName}`,
      html: `<p>Ahoj,</p><p>děkujeme za nákup <strong>${esc(order.productName)}</strong> (${esc(formatCzk(order.amountCzk))}).</p><p><a href="${esc(link)}">Stáhnout soubor</a></p><p>Odkaz je platný pro tebe — nesdílej ho veřejně.</p>${invoiceNote}<p>S pozdravem,<br>Nia Dobyšar</p>`,
      text: `Děkujeme za nákup ${order.productName} (${formatCzk(order.amountCzk)}).\n\nStáhnout: ${link}${invoiceUrl ? `\n\nFaktura: ${invoiceUrl}` : ""}\n\nS pozdravem, Nia Dobyšar`,
    });

    await resendSend(apiKey, {
      from: resolveNiaFrom(),
      to: [resolveNiaTo()],
      subject: `Nový nákup — ${order.productName}`,
      html: `<p><strong>${esc(order.productName)}</strong><br>${esc(formatCzk(order.amountCzk))}<br>${esc(customerEmail)}</p>`,
      text: `Nový nákup: ${order.productName} — ${formatCzk(order.amountCzk)} — ${customerEmail}`,
    });
  }

  return { product, link };
}

export { productPurchasable } from "@/lib/nia/shop-product";

export function absoluteImageUrl(imageUrl: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${siteBaseUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}
