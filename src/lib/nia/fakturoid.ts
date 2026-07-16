export type FakturoidResult = {
  ok: true;
  invoiceId: number;
  invoiceUrl: string;
} | {
  ok: false;
  error: string;
};

function configured(): boolean {
  return Boolean(
    process.env.FAKTUROID_ACCOUNT_SLUG?.trim() &&
      process.env.FAKTUROID_API_TOKEN?.trim() &&
      process.env.FAKTUROID_USER_EMAIL?.trim(),
  );
}

function authHeader(): string {
  const token = process.env.FAKTUROID_API_TOKEN!.trim();
  return `Basic ${Buffer.from(`${token}:X`).toString("base64")}`;
}

function userAgent(): string {
  const email = process.env.FAKTUROID_USER_EMAIL!.trim();
  const app = process.env.FAKTUROID_APP_NAME?.trim() || "NiaDobysarShop";
  return `${app} (${email})`;
}

function apiBase(): string {
  return `https://app.fakturoid.cz/api/v3/accounts/${process.env.FAKTUROID_ACCOUNT_SLUG!.trim()}`;
}

async function fakturoidFetch(path: string, init?: RequestInit) {
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "User-Agent": userAgent(),
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

async function findOrCreateSubject(email: string, name?: string): Promise<number | null> {
  const q = encodeURIComponent(email);
  const search = await fakturoidFetch(`/subjects/search.json?query=${q}`);
  if (search.ok) {
    const list = (await search.json()) as { id: number; email?: string }[];
    if (Array.isArray(list) && list.length > 0) return list[0].id;
  }

  const create = await fakturoidFetch("/subjects.json", {
    method: "POST",
    body: JSON.stringify({
      name: name?.trim() || email.split("@")[0] || "Zákazník",
      email,
      full_name: name?.trim() || undefined,
    }),
  });
  if (!create.ok) return null;
  const subject = (await create.json()) as { id: number };
  return subject.id;
}

export async function createInvoiceForOrder(input: {
  customerEmail: string;
  customerName?: string;
  productName: string;
  amountCzk: number;
  paidOn?: string;
}): Promise<FakturoidResult> {
  if (!configured()) {
    return { ok: false, error: "Fakturoid není nakonfigurován." };
  }

  const subjectId = await findOrCreateSubject(input.customerEmail, input.customerName);
  if (!subjectId) {
    return { ok: false, error: "Nepodařilo vytvořit kontakt ve Fakturoidu." };
  }

  const vatRate = Number(process.env.FAKTUROID_VAT_RATE || "21");
  const lineName = input.productName;
  const unitPrice = input.amountCzk;

  const body: Record<string, unknown> = {
    subject_id: subjectId,
    currency: "CZK",
    language: "cz",
    payment_method: "card",
    lines: [
      {
        name: lineName,
        quantity: 1,
        unit_price: unitPrice,
        vat_rate: vatRate,
      },
    ],
    note: "Digitální produkt — odkaz ke stažení byl odeslán e-mailem.",
  };

  if (input.paidOn) {
    body.status = "paid";
    body.paid_on = input.paidOn.slice(0, 10);
  }

  const res = await fakturoidFetch("/invoices.json", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text.slice(0, 200) || "Fakturoid API chyba." };
  }

  const invoice = (await res.json()) as { id: number; public_html_url?: string; html_url?: string };
  const invoiceUrl =
    invoice.public_html_url ||
    invoice.html_url ||
    `https://app.fakturoid.cz/${process.env.FAKTUROID_ACCOUNT_SLUG}/invoices/${invoice.id}`;

  const send = await fakturoidFetch(`/invoices/${invoice.id}/message.json`, {
    method: "POST",
    body: JSON.stringify({
      email: input.customerEmail,
      subject: `Faktura — ${lineName}`,
      message: "Děkujeme za nákup. Fakturu najdeš v příloze / na odkazu. Soubor ke stažení produktu jsme poslali v samostatném e-mailu.",
    }),
  });

  if (!send.ok) {
    console.warn("[fakturoid] invoice created but email not sent", invoice.id);
  }

  return { ok: true, invoiceId: invoice.id, invoiceUrl };
}

export function fakturoidConfigured(): boolean {
  return configured();
}
