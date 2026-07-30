import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "../types";
import { Sheet } from "./Sheet";
import { PlusIcon } from "./icons";

const STORAGE_KEY = "lunacat-products";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function loadProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Product[];
  } catch {
    return [];
  }
}

export function ProductPage() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsedPrice = Number(price);

    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter product name and price.");
      return;
    }

    setProducts((prev) => [
      ...prev,
      {
        id: `product-${Date.now()}`,
        name: name.trim(),
        price: Math.round(parsedPrice),
      },
    ]);
    setName("");
    setPrice("");
    setError("");
    setFormOpen(false);
  }

  function openForm() {
    setName("");
    setPrice("");
    setError("");
    setFormOpen(true);
  }

  return (
    <>
      <section aria-labelledby="product-title" className="px-5 pb-26 pt-2 animate-section-refresh">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase text-muted">Product</p>
            <h2 id="product-title" className="text-xl font-semibold text-ink">
              Products
            </h2>
          </div>
          <button
            type="button"
            onClick={openForm}
            className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border-0 bg-accent px-3 text-xs font-black text-accent-ink transition active:scale-[0.98] [&_svg]:h-4 [&_svg]:w-4"
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {products.length ? (
          <div className="grid gap-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <strong className="min-w-0 text-[0.92rem] text-ink [overflow-wrap:anywhere]">{product.name}</strong>
                <span className="rounded-xl bg-canvas px-3 py-1.5 text-[0.78rem] font-black text-accent">
                  {currencyFormatter.format(product.price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white/62 p-5">
            <strong className="block text-[0.96rem] text-ink">No products yet</strong>
            <span className="text-[0.86rem] leading-snug text-muted">Add products with prices to prepare this page.</span>
          </div>
        )}
      </section>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} kicker="Product" title="Add product" titleId="product-form-title">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
            <span>Product</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
              placeholder="Name"
            />
          </label>
          <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
            <span>Price</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
              placeholder="0"
            />
          </label>
          {error && <p className="mb-0 text-[0.78rem] font-extrabold text-[#b83f28]">{error}</p>}
          <button
            type="submit"
            className="min-h-12.5 rounded-2xl border-0 bg-accent text-sm font-black text-accent-ink transition active:scale-[0.98]"
          >
            Save product
          </button>
        </form>
      </Sheet>
    </>
  );
}
