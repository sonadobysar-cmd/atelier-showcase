import type { CmsProduct } from "@/lib/nia/cms-catalog-types";

export function productPurchasable(p: CmsProduct): boolean {
  return p.active && typeof p.priceCzk === "number" && p.priceCzk > 0 && Boolean(p.downloadUrl?.trim());
}
