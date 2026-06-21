export type ResendPayload = {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  html: string;
  text: string;
};

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
  return process.env.NIA_EMAIL_FROM?.trim() || process.env.EMAIL_FROM?.trim() || "Nia Dobyšar <onboarding@resend.dev>";
}

export function resolveNiaTo(): string {
  return process.env.NIA_EMAIL_TO?.trim() || "niadobyshar@gmail.com";
}
