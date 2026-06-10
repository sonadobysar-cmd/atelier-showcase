const shots = [
  "https://images.unsplash.com/photo-1545205597-3b93994ff32a?w=600&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e06ed7081a?w=600&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
];

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Studio & retreaty</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {shots.map((src) => (
          <div
            key={src}
            className="aspect-[4/5] rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
    </div>
  );
}
