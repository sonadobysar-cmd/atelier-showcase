import { NextResponse } from "next/server";
import { readViniContent } from "@/lib/vini/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await readViniContent();
  return NextResponse.json(
    { ok: true, content },
    { headers: { "Cache-Control": "no-store, max-age=0", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" } },
  );
}
