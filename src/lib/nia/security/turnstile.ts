const PLACEHOLDER_VALUES = new Set([
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "your-site-key",
  "your-secret-key",
]);

export function isPlausibleTurnstileSiteKey(key: string | null | undefined): boolean {
  if (!key) return false;
  const k = key.trim();
  if (k.length < 20 || k.length > 200) return false;
  if (PLACEHOLDER_VALUES.has(k)) return false;
  if (/TURNSTILE_|SECRET_KEY|SITE_KEY/i.test(k)) return false;
  return k.startsWith("0x");
}

export function isPlausibleTurnstileSecret(key: string | null | undefined): boolean {
  if (!key) return false;
  const k = key.trim();
  if (k.length < 20 || k.length > 200) return false;
  if (PLACEHOLDER_VALUES.has(k)) return false;
  if (/TURNSTILE_|SECRET_KEY|SITE_KEY/i.test(k)) return false;
  return k.startsWith("0x");
}

export async function verifyTurnstile(token: unknown, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || !isPlausibleTurnstileSecret(secret)) {
    console.error("[nia/security] TURNSTILE_SECRET_KEY missing or invalid placeholder");
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
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.error("[nia/security] turnstile verify rejected", data["error-codes"] ?? data);
    }
    return Boolean(data.success);
  } catch (err) {
    console.error("[nia/security] turnstile verify failed", err);
    return false;
  }
}

export function turnstileSiteKey(): string | null {
  const key = process.env.TURNSTILE_SITE_KEY?.trim();
  if (!key || !isPlausibleTurnstileSiteKey(key)) return null;
  return key;
}
