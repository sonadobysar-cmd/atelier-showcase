const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map();

function text(value, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function allowedOrigin(origin) {
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "vinidelite.cz" || host === "www.vinidelite.cz" || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((stamp) => now - stamp < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Použijte kontaktní formulář." });
  }
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ ok: false, error: "Požadavek nebyl povolen." });

  const ip = text((req.headers["x-forwarded-for"] || "").split(",")[0], 80) || "unknown";
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: "Odesíláte příliš rychle. Zkuste to prosím za několik minut." });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (text(body.website, 200)) return res.status(200).json({ ok: true });

  const name = text(body.name, 120);
  const email = text(body.email, 180).toLowerCase();
  const phone = text(body.phone, 60);
  const topic = text(body.topic, 160) || "Obecný dotaz";
  const message = text(body.message, 4000);
  const context = text(body.context, 300);

  if (name.length < 2) return res.status(400).json({ ok: false, error: "Doplňte prosím své jméno." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: "Doplňte platný e-mail." });
  if (message.length < 8) return res.status(400).json({ ok: false, error: "Napište prosím krátce, s čím vám můžeme pomoci." });

  const apiKey = text(process.env.RESEND_API_KEY, 300);
  if (!apiKey) {
    console.error("[vini/contact] RESEND_API_KEY is missing");
    return res.status(503).json({ ok: false, error: "Formulář se právě nepodařilo připojit. Zkuste to prosím později." });
  }

  const lines = [`Téma: ${topic}`, context ? `Kontext: ${context}` : "", `Jméno: ${name}`, `E-mail: ${email}`, phone ? `Telefon: ${phone}` : "", "", message].filter(Boolean);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.VINI_EMAIL_FROM || process.env.NIA_EMAIL_FROM || "Vini d’Elite <onboarding@resend.dev>",
      to: [process.env.VINI_EMAIL_TO || process.env.NIA_EMAIL_TO || "niadobysar@gmail.com"],
      reply_to: email,
      subject: `Vini d’Elite — ${topic}`,
      text: lines.join("\n"),
      html: `<h2>Nová zpráva z Vini d’Elite</h2><p><strong>Téma:</strong> ${escapeHtml(topic)}${context ? `<br><strong>Kontext:</strong> ${escapeHtml(context)}` : ""}<br><strong>Jméno:</strong> ${escapeHtml(name)}<br><strong>E-mail:</strong> ${escapeHtml(email)}${phone ? `<br><strong>Telefon:</strong> ${escapeHtml(phone)}` : ""}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });
  if (!response.ok) {
    console.error("[vini/contact] Resend failed", response.status, await response.text());
    return res.status(502).json({ ok: false, error: "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu." });
  }
  return res.status(200).json({ ok: true });
}
