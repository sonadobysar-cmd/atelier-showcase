const shots = [
  "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
];

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Before & after</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {shots.map((src) => (
          <div
            key={src}
            className="aspect-[3/4] rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
    </div>
  );
}
