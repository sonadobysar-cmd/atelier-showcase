import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { buildAiEnhancePrompt, type AiEnhanceResult } from "@/lib/gloss-ai-enhance";
import type { GlossEffectConfig } from "@/lib/gloss-face-effects";

type Body = {
  image: string;
  lookLabel: string;
  config: GlossEffectConfig;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatný požadavek." } satisfies AiEnhanceResult, {
      status: 400,
    });
  }

  const { image, lookLabel, config } = body;
  if (!image?.startsWith("data:image")) {
    return NextResponse.json({ ok: false, error: "Chybí obrázek." } satisfies AiEnhanceResult, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "GEMINI_API_KEY není nastaven — použijeme lokální vylepšení." } satisfies AiEnhanceResult,
      { status: 503 },
    );
  }

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  const prompt = buildAiEnhancePrompt(config, lookLabel);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-exp",
    });

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64,
        },
      },
    ]);

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if ("inlineData" in part && part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? "image/png";
        return NextResponse.json({
          ok: true,
          imageDataUrl: `data:${mime};base64,${part.inlineData.data}`,
          provider: "gemini",
        } satisfies AiEnhanceResult);
      }
    }

    return NextResponse.json(
      { ok: false, error: "Model nevrátil obrázek — zkus lokální režim." } satisfies AiEnhanceResult,
      { status: 502 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI selhalo";
    return NextResponse.json({ ok: false, error: msg } satisfies AiEnhanceResult, { status: 502 });
  }
}
