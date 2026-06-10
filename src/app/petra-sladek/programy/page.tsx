import { petraSladekPrograms } from "@/lib/site-data";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Programy</h1>
      <p className="mt-2 opacity-60">Petra Sladek · koučink online i osobně v Praze</p>
      <div className="mt-10 space-y-6">
        {petraSladekPrograms.map((p) => (
          <article key={p.name} className="rounded-2xl border border-black/8 p-6">
            <h2 className="text-lg font-medium">{p.name}</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-65">{p.desc}</p>
            <p className="mt-3 font-medium opacity-80">{p.price}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
