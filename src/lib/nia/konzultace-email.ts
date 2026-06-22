import { formatWhen } from "@/lib/nia/konzultace-schedule";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type KonzBooking = {
  ref: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: Date;
  time: string;
  meetUrl: string;
};

export function buildClientConfirmationHtml(b: KonzBooking): string {
  const when = formatWhen(b.date, b.time);
  return `<!DOCTYPE html><html lang="cs"><body style="margin:0;background:#f6f0ea;font-family:Georgia,serif;color:#1a1210">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 8px 32px rgba(26,18,16,.08)">
<p style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#9e4d6a;margin:0 0 20px">Nia Dobyšar · Webdesign</p>
<h1 style="font-size:26px;font-weight:400;margin:0 0 8px">Konzultace je rezervovaná</h1>
<p style="color:#5c4a44;line-height:1.7;margin:0 0 24px">Ahoj ${esc(b.name)}, těšíme se na setkání online. Konzultace trvá cca 30 minut — čistě informativní úvod k tvému projektu.</p>
<p style="background:#faf7f4;border-radius:12px;padding:18px 20px;margin:0 0 24px;line-height:1.6"><strong>Termín:</strong> ${esc(when)}<br><strong>Ref:</strong> ${esc(b.ref)}</p>
<p style="margin:0 0 20px">Připoj se v čase schůzky přes Google Meet:</p>
<p style="margin:0 0 28px"><a href="${esc(b.meetUrl)}" style="display:inline-block;background:#5c2a3e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:13px;letter-spacing:.12em;text-transform:uppercase">Otevřít Google Meet</a></p>
<p style="font-size:13px;color:#7a6560;line-height:1.65;margin:0">Odkaz: <a href="${esc(b.meetUrl)}" style="color:#9e4d6a">${esc(b.meetUrl)}</a></p>
<p style="font-size:12px;color:#9a8580;margin:28px 0 0;line-height:1.6">Osobní schůzku domlouváme až po úvodní online konzultaci. Máš-li dotaz, odpověz na tento e-mail.</p>
</div></div></body></html>`;
}

export function buildClientConfirmationText(b: KonzBooking): string {
  const when = formatWhen(b.date, b.time);
  return `Konzultace je rezervovaná\n\nTermín: ${when}\nRef: ${b.ref}\n\nGoogle Meet: ${b.meetUrl}\n\nKonzultace trvá cca 30 minut (informativní úvod).\n\nNia Dobyšar · Webdesign studio`;
}

export function buildAdminNotificationHtml(b: KonzBooking): string {
  const when = formatWhen(b.date, b.time);
  return `<p><strong>Nová online konzultace</strong> · ${esc(b.ref)}</p>
<p><strong>Termín:</strong> ${esc(when)}<br>
<strong>Jméno:</strong> ${esc(b.name)}<br>
<strong>E-mail:</strong> ${esc(b.email)}<br>
<strong>Telefon:</strong> ${esc(b.phone)}<br>
</p>
<p><strong>Google Meet:</strong> <a href="${esc(b.meetUrl)}">${esc(b.meetUrl)}</a></p>
<p style="white-space:pre-wrap">${esc(b.message)}</p>`;
}

export function buildAdminNotificationText(b: KonzBooking): string {
  const when = formatWhen(b.date, b.time);
  return `Nová online konzultace · ${b.ref}\n\nTermín: ${when}\nJméno: ${b.name}\nE-mail: ${b.email}\nTelefon: ${b.phone}\nMeet: ${b.meetUrl}\n\n${b.message}`;
}
