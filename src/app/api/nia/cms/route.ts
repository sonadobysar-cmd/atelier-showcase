import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { getCatalog, publicCatalog } from "@/lib/nia/cms-catalog";
import type { ProductType } from "@/lib/nia/cms-catalog-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") || "all";
  const type = url.searchParams.get("type") as ProductType | null;
  const industry = url.searchParams.get("industry")?.trim() || "";

  const catalog = publicCatalog(await getCatalog());

  if (scope === "ugc") {
    return NextResponse.json({
      ok: true,
      ugcVideos: catalog.ugcVideos,
      industries: catalog.industries,
    });
  }

  let products = catalog.products;
  if (type === "template" || type === "stock") {
    products = products.filter((p) => p.type === type);
  }
  if (industry) {
    products = products.filter((p) => p.industryId === industry);
  }

  return NextResponse.json({
    ok: true,
    industries: catalog.industries,
    products,
    ugcVideos: scope === "all" ? catalog.ugcVideos : undefined,
  });
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
