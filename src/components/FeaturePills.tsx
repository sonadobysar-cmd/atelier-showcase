import { type BrandFeature, featureLabels } from "@/lib/brands";

export function FeaturePills({ features }: { features: BrandFeature[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((f) => (
        <span
          key={f}
          className="rounded-full border border-current/15 bg-current/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider opacity-80"
        >
          {featureLabels[f]}
        </span>
      ))}
    </div>
  );
}
