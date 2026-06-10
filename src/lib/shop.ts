export type ShopProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

export function formatPrice(czk: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(czk);
}
