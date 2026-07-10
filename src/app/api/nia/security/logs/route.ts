import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/nia/security/allowed-origins";
import { exportSubmissionLogs, listSubmissionLogs } from "@/lib/nia/security/submission-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkAuth(req: Request): boolean {
  const secret = process.env.NIA_SECURITY_LOG_TOKEN?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  if (auth === `Bearer ${secret}`) return true;
  const q = new URL(req.url).searchParams.get("token")?.trim();
  return q === secret;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  const limit = Math.min(2000, Math.max(1, Number(url.searchParams.get("limit") || 500)));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));

  const logs = format === "full" ? await exportSubmissionLogs() : await listSubmissionLogs(limit, offset);

  if (format === "download") {
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), count: logs.length, logs }, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="nia-submission-logs-${Date.now()}.json"`,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    count: logs.length,
    logs,
  });
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
