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
  priceLabel?: string;
  active: boolean;
  order: number;
  createdAt: string;
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
