import type { ServiceGroup } from "@/lib/brand-content";

export function ServiceCatalog({
  groups,
  accent,
}: {
  groups: ServiceGroup[];
  accent: string;
}) {
  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="font-display text-2xl">{group.title}</h2>
          <ul className="mt-6 divide-y divide-black/8">
            {group.items.map((item) => (
              <li key={item.name} className="flex flex-col gap-2 py-5 sm:flex-row sm:justify-between">
                <div className="max-w-xl">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-60">{item.desc}</p>
                </div>
                {item.price && (
                  <p className="shrink-0 font-medium sm:pl-6" style={{ color: accent }}>
                    {item.price}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
