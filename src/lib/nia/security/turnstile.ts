export async function verifyTurnstile(token: unknown, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[nia/security] TURNSTILE_SECRET_KEY missing");
    return false;
  }
  if (typeof token !== "string" || token.length < 10) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp !== "unknown" ? remoteIp : "",
  });

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[nia/security] turnstile verify failed", err);
    return false;
  }
}

export function turnstileSiteKey(): string | null {
  const key = process.env.TURNSTILE_SITE_KEY?.trim();
  return key || null;
}
