import { sknTtPortfolio } from "@/lib/site-data";

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Portfolio</h1>
      <p className="mt-2 text-sm opacity-50">Fine line · single needle</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {sknTtPortfolio.map((item) => (
          <figure key={item.image} className="overflow-hidden rounded-xl">
            <div
              className="aspect-square bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <figcaption className="mt-3 flex justify-between text-sm opacity-60">
              <span>{item.artist}</span>
              <span>{item.style}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
