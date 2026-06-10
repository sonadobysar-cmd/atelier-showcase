"use client";

import { GlossSignatureRitual } from "@/components/gloss/GlossSignatureRitual";
import { GlossReveal } from "@/components/gloss/GlossReveal";

type Props = {
  onReserve: (procedureName: string) => void;
};

export function GlossPlayground({ onReserve }: Props) {
  return (
    <GlossReveal>
      <GlossSignatureRitual onReserve={onReserve} />
    </GlossReveal>
  );
}
