export type ResendPayload = {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  html: string;
  text: string;
};

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  let s = value.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function normalizeFrom(raw: string | undefined): string {
  const s = cleanEnv(raw);
  if (!s) return "";
  if (s.includes("<") && s.includes(">")) return s;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `Nia Dobyšar <${s}>`;
  return s;
}

export async function resendSend(apiKey: string, payload: ResendPayload): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

export function resolveNiaFrom(): string {
  const raw =
    normalizeFrom(process.env.NIA_EMAIL_FROM) ||
    normalizeFrom(process.env.EMAIL_FROM) ||
    "";
  if (raw) return raw;
  return "Nia Dobyšar <onboarding@resend.dev>";
}

export function resolveNiaTo(): string {
  return cleanEnv(process.env.NIA_EMAIL_TO) || "niadobysar@gmail.com";
}

export function parseResendError(body: string): string {
  try {
    const j = JSON.parse(body) as { message?: string };
    return typeof j.message === "string" ? j.message : "";
  } catch {
    return "";
  }
}
