export type ShopOrderStatus = "pending" | "paid" | "failed";

export type ShopOrder = {
  id: string;
  productId: string;
  productName: string;
  productType: "template" | "stock";
  customerEmail: string;
  amountCzk: number;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: ShopOrderStatus;
  downloadToken: string;
  fakturoidInvoiceId?: number;
  fakturoidInvoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
};
