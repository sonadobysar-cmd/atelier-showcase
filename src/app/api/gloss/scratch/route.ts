import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  isValidEmail,
  makeScratchCode,
  normalizeScratchEmail,
  rollScratchDiscount,
} from "@/lib/gloss-scratch";

type ScratchEntry = {
  email: string;
  discount: number;
  code: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "gloss-scratch-emails.json");

async function readStore(): Promise<ScratchEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as ScratchEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStore(entries: ScratchEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  const email = normalizeScratchEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Zadej platný email." }, { status: 400 });
  }

  const store = await readStore();
  const existing = store.find((e) => e.email === email);
  if (existing) {
    return NextResponse.json({
      discount: existing.discount,
      code: existing.code,
      reused: true,
    });
  }

  const discount = rollScratchDiscount();
  const code = makeScratchCode(discount);
  const entry: ScratchEntry = {
    email,
    discount,
    code,
    createdAt: new Date().toISOString(),
  };

  store.push(entry);
  await writeStore(store);

  return NextResponse.json({ discount, code });
}
