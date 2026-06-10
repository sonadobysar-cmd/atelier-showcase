"use client";

import { useState } from "react";
import { formatPrice, type ShopProduct } from "@/lib/shop";

export function ShopDemo({ products, accent }: { products: ShopProduct[]; accent: string }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkedOut, setCheckedOut] = useState(false);

  const total = products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.price, 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  function add(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  if (checkedOut) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}
      >
        <p className="font-display text-2xl">Objednávka přijata</p>
        <p className="mt-2 text-sm opacity-70">
          Demo e-shop — v produkci by následovala platba a potvrzení e-mailem.
        </p>
        <button type="button" onClick={() => { setCheckedOut(false); setCart({}); }} className="mt-6 text-sm underline opacity-60">
          Nová objednávka
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl border border-black/8 bg-white/60">
            <div
              className="aspect-[4/3] bg-cover bg-center"
              style={{ backgroundImage: `url(${p.image})` }}
            />
            <div className="p-5">
              <h3 className="font-medium">{p.name}</h3>
              <p className="mt-1 text-sm opacity-60">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">{formatPrice(p.price)}</span>
                <button
                  type="button"
                  onClick={() => add(p.id)}
                  className="rounded-full px-4 py-1.5 text-sm text-white"
                  style={{ backgroundColor: accent }}
                >
                  Do košíku
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {count > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur">
          <span className="text-sm">
            Košík: <strong>{count}</strong> · {formatPrice(total)}
          </span>
          <button
            type="button"
            onClick={() => setCheckedOut(true)}
            className="rounded-full px-6 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Dokončit objednávku
          </button>
        </div>
      )}
    </div>
  );
}
