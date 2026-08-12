import { NextResponse } from "next/server";
import { readViniContent } from "@/lib/vini/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await readViniContent();
  return NextResponse.json(
    { ok: true, content },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", "X-Content-Type-Options": "nosniff" } },
  );
}

