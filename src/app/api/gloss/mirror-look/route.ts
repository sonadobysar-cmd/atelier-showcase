import { GoogleGenAI, Modality } from "@google/genai";
import { NextResponse } from "next/server";
import { buildMirrorLookPrompt, type MirrorLookResult } from "@/lib/gloss-mirror-prompt";
import type { RitualIngredientId } from "@/lib/gloss-ritual";

type Body = {
  ingredients: RitualIngredientId[];
  procedure: string;
};

const MODEL =
  process.env.GEMINI_MIRROR_MODEL ??
  process.env.GEMINI_IMAGE_MODEL ??
  "gemini-2.0-flash-preview-image-generation";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." } satisfies MirrorLookResult, {
      status: 400,
    });
  }

  const { ingredients, procedure } = body;
  if (!ingredients?.length || !procedure) {
    return NextResponse.json({ ok: false, error: "Chybí výběr procedur." } satisfies MirrorLookResult, {
      status: 400,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "GEMINI_API_KEY není nastaven." } satisfies MirrorLookResult,
      { status: 503 },
    );
  }

  const prompt = buildMirrorLookPrompt(ingredients, procedure);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? "image/png";
        return NextResponse.json({
          ok: true,
          imageDataUrl: `data:${mime};base64,${part.inlineData.data}`,
          provider: "gemini",
        } satisfies MirrorLookResult);
      }
    }

    return NextResponse.json(
      { ok: false, error: "Model nevrátil obrázek." } satisfies MirrorLookResult,
      { status: 502 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generování selhalo";
    return NextResponse.json({ ok: false, error: msg } satisfies MirrorLookResult, { status: 502 });
  }
}
