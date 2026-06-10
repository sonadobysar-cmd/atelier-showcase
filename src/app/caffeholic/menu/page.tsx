import { getBrand } from "@/lib/brands";
import { caffeholicMenu } from "@/lib/site-data";

const brand = getBrand("caffeholic")!;

export default function Page() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Menu</h1>
      <p className="mt-2 text-sm opacity-60">CaffeHolic · sezónní nabídka</p>
      <ul className="mt-10 divide-y divide-black/8">
        {caffeholicMenu.map((item) => (
          <li key={item.name} className="flex justify-between py-4">
            <span>{item.name}</span>
            <span style={{ color: brand.accent }}>{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
