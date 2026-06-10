import type { Metadata } from "next";
import { ContourHome } from "@/components/contour/ContourHome";
import { getBrand } from "@/lib/brands";

const brand = getBrand("contour-clinic")!;

export const metadata: Metadata = {
  title: "Contour Clinic",
  description: brand.tagline,
};

export default function Page() {
  return <ContourHome />;
}
