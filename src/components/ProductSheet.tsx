import { useEffect, useState, type FormEvent } from "react";
import { Sheet } from "./Sheet";
import type { Product } from "../types";
import { EditIcon, TrashIcon } from "./icons";

interface ProductSheetProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "lunacat-products";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type StoredProduct = Partial<Product> & {
  id?: string;
  name?: string;
  price?: number;
};

function normalizeAmount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
}

function loadProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as StoredProduct[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((product, index) => ({
      id: product.id ?? `product-${index}`,
      name: product.name?.trim() || "Untitled product",
      costPrice: normalizeAmount(product.costPrice),
      salePrice: normalizeAmount(product.salePrice ?? product.price),
      stock: normalizeAmount(product.stock),
    }));
  } catch {
    return [];
  }
}

export function ProductSheet({ open, onClose }: ProductSheetProps) {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsedCostPrice = Number(costPrice);
    const parsedSalePrice = Number(salePrice);
    const parsedStock = Number(stock);

    if (
      !name.trim() ||
      !Number.isFinite(parsedCostPrice) ||
      parsedCostPrice < 0 ||
      !Number.isFinite(parsedSalePrice) ||
      parsedSalePrice <= 0 ||
      !Number.isFinite(parsedStock) ||
      parsedStock < 0
    ) {
      setError("กรอกชื่อสินค้า ราคาทุน ราคาขาย และสต๊อกให้ถูกต้อง");
      return;
    }

    const nextProduct = {
      id: editingProduct?.id ?? `product-${Date.now()}`,
      name: name.trim(),
      costPrice: Math.round(parsedCostPrice),
      salePrice: Math.round(parsedSalePrice),
      stock: Math.round(parsedStock),
    };

    if (editingProduct) {
      setProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? nextProduct : product)));
    } else {
      setProducts((prev) => [...prev, nextProduct]);
    }

    resetForm();
  }

  function resetForm() {
    setName("");
    setCostPrice("");
    setSalePrice("");
    setStock("");
    setError("");
    setEditingProduct(null);
  }

  function openEditForm(product: Product) {
    setName(product.name);
    setCostPrice(String(product.costPrice));
    setSalePrice(String(product.salePrice));
    setStock(String(product.stock));
    setError("");
    setEditingProduct(product);
  }

  function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    setProducts((prev) => prev.filter((item) => item.id !== product.id));

    if (editingProduct?.id === product.id) {
      resetForm();
    }
  }

  return (
    <Sheet open={open} onClose={onClose} kicker="Product" title="Products" titleId="product-title">
      <form className="mb-4 grid gap-3 rounded-2xl bg-canvas p-3" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
            <span>Product</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-10 rounded-lg border border-line bg-surface px-3 text-ink"
              placeholder="Name"
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
              <span>Cost</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
                className="min-h-10 rounded-lg border border-line bg-surface px-3 text-ink"
                placeholder="0"
              />
            </label>
            <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
              <span>Sale</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
                className="min-h-10 rounded-lg border border-line bg-surface px-3 text-ink"
                placeholder="0"
              />
            </label>
            <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
              <span>Stock</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="min-h-10 rounded-lg border border-line bg-surface px-3 text-ink"
                placeholder="0"
              />
            </label>
          </div>
        </div>
        {error && <p className="mb-0 text-[0.78rem] font-extrabold text-[#b83f28]">{error}</p>}
        <button
          type="submit"
          className="min-h-10 rounded-xl border-0 bg-accent text-sm font-black text-accent-ink transition active:scale-[0.98]"
        >
          {editingProduct ? "Update product" : "Add product"}
        </button>
        {editingProduct && (
          <button
            type="button"
            onClick={resetForm}
            className="min-h-10 rounded-xl border border-line bg-surface text-sm font-black text-muted transition active:scale-[0.98]"
          >
            Cancel edit
          </button>
        )}
      </form>

      {products.length ? (
        <div className="grid gap-2">
          {products.map((product) => {
            const unitProfit = product.salePrice - product.costPrice;
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className={[
                  "rounded-2xl border border-line px-4 py-3 transition",
                  isOutOfStock ? "bg-canvas/45 opacity-60" : "bg-canvas",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong className={["min-w-0 text-[0.92rem] [overflow-wrap:anywhere]", isOutOfStock ? "text-muted" : "text-ink"].join(" ")}>
                    {product.name}
                  </strong>
                  <div className="flex flex-none items-center gap-1.5">
                    <span
                      className={[
                        "rounded-xl bg-surface px-3 py-1.5 text-[0.78rem] font-black",
                        isOutOfStock ? "text-subtle" : "text-accent",
                      ].join(" ")}
                    >
                      {product.stock} ชิ้น
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditForm(product)}
                      aria-label={`Edit ${product.name}`}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-surface text-muted transition active:scale-[0.96] [&_svg]:h-4 [&_svg]:w-4"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      aria-label={`Delete ${product.name}`}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-[#f0c8bd] bg-[#fff2f0] text-[#b83f28] transition active:scale-[0.96] [&_svg]:h-4 [&_svg]:w-4"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[0.68rem] font-bold text-muted">
                  <span>ทุน {currencyFormatter.format(product.costPrice)}</span>
                  <span>ขาย {currencyFormatter.format(product.salePrice)}</span>
                  <span>กำไร {currencyFormatter.format(unitProfit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-canvas p-5">
          <strong className="block text-[0.96rem] text-ink">No products yet</strong>
          <span className="text-[0.86rem] leading-snug text-muted">เพิ่มสินค้าเพื่อดูต้นทุน ราคาขาย กำไร และสต๊อก</span>
        </div>
      )}
    </Sheet>
  );
}
