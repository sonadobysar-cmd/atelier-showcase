export type ProductType = "template" | "stock";

export type CmsIndustry = {
  id: string;
  label: string;
};

export type CmsProduct = {
  id: string;
  type: ProductType;
  name: string;
  industryId: string;
  imageUrl: string;
  description?: string;
  /** Zobrazení v katalogu (např. „od 299 Kč“). */
  priceLabel?: string;
  /** Prodejní cena v Kč — musí být > 0 pro tlačítko Koupit. */
  priceCzk?: number;
  /** Interní klíč souboru ke stažení (private blob / data složka). */
  downloadUrl?: string;
  active: boolean;
  order: number;
  createdAt: string;
};

export type CmsProductPublic = Omit<CmsProduct, "downloadUrl"> & {
  purchasable: boolean;
};

export type CmsUgcVideo = {
  id: string;
  title: string;
  industryId?: string;
  videoUrl: string;
  posterUrl?: string;
  active: boolean;
  order: number;
  createdAt: string;
};

export type CmsCatalog = {
  industries: CmsIndustry[];
  products: CmsProduct[];
  ugcVideos: CmsUgcVideo[];
};
