import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Product } from "../types";
import { Sheet } from "./Sheet";
import { EditIcon, PlusIcon, TrashIcon } from "./icons";

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

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

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

    return parsed
      .map((product, index) => {
        const salePrice = normalizeAmount(product.salePrice ?? product.price);

        return {
          id: product.id ?? `product-${index}`,
          name: product.name?.trim() || "Untitled product",
          costPrice: normalizeAmount(product.costPrice),
          salePrice,
          stock: normalizeAmount(product.stock),
        };
      })
      .filter((product) => product.name);
  } catch {
    return [];
  }
}

function formatMoney(value: number) {
  return currencyFormatter.format(value);
}

export function ProductPage() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const summary = useMemo(() => {
    return products.reduce(
      (total, product) => {
        const unitProfit = product.salePrice - product.costPrice;

        total.stock += product.stock;
        total.costValue += product.costPrice * product.stock;
        total.revenueValue += product.salePrice * product.stock;
        total.profitValue += unitProfit * product.stock;

        return total;
      },
      {
        stock: 0,
        costValue: 0,
        revenueValue: 0,
        profitValue: 0,
      },
    );
  }, [products]);

  const marginPercent = summary.revenueValue > 0 ? Math.round((summary.profitValue / summary.revenueValue) * 100) : 0;

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

    closeForm();
  }

  function closeForm() {
    setName("");
    setCostPrice("");
    setSalePrice("");
    setStock("");
    setError("");
    setEditingProduct(null);
    setFormOpen(false);
  }

  function openForm() {
    setName("");
    setCostPrice("");
    setSalePrice("");
    setStock("");
    setError("");
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setName(product.name);
    setCostPrice(String(product.costPrice));
    setSalePrice(String(product.salePrice));
    setStock(String(product.stock));
    setError("");
    setEditingProduct(product);
    setFormOpen(true);
  }

  function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    setProducts((prev) => prev.filter((item) => item.id !== product.id));

    if (editingProduct?.id === product.id) {
      closeForm();
    }
  }

  return (
    <>
      <section aria-labelledby="product-title" className="px-5 pb-26 pt-2 animate-section-refresh">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
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

        <div className="mb-4 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-surface p-3">
              <p className="mb-1 text-[0.62rem] font-black uppercase text-muted">Stock</p>
              <strong className="block text-[1rem] leading-tight text-ink">{numberFormatter.format(summary.stock)}</strong>
              <span className="text-[0.7rem] font-bold text-muted">ชิ้นทั้งหมด</span>
            </div>
            <div className="rounded-2xl bg-[#e6f5ef] p-3">
              <p className="mb-1 text-[0.62rem] font-black uppercase text-[#287c5d]">Profit</p>
              <strong className="block text-[1rem] leading-tight text-[#176246]">{formatMoney(summary.profitValue)}</strong>
              <span className="text-[0.7rem] font-bold text-[#287c5d]">Margin {marginPercent}%</span>
            </div>
          </div>
          <div className="rounded-2xl bg-surface p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="mb-0 text-[0.64rem] font-black uppercase text-muted">Overview</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.72rem] font-bold">
              <span className="min-w-0 text-muted [overflow-wrap:anywhere]">ทุน {formatMoney(summary.costValue)}</span>
              <span className="min-w-0 text-right text-muted [overflow-wrap:anywhere]">ขายได้ {formatMoney(summary.revenueValue)}</span>
            </div>
          </div>
        </div>

        {products.length ? (
          <div className="grid gap-2">
            {products.map((product) => {
              const unitProfit = product.salePrice - product.costPrice;
              const totalProfit = unitProfit * product.stock;
              const isLoss = unitProfit < 0;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className={[
                    "rounded-2xl border border-line px-4 py-3 transition",
                    isOutOfStock ? "bg-surface/45 opacity-60" : "bg-surface",
                  ].join(" ")}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <strong className={["min-w-0 text-[0.92rem] [overflow-wrap:anywhere]", isOutOfStock ? "text-muted" : "text-ink"].join(" ")}>
                      {product.name}
                    </strong>
                    <div className="flex flex-none items-center gap-1.5">
                      <span
                        className={[
                          "rounded-xl px-3 py-1.5 text-[0.72rem] font-black",
                          isOutOfStock ? "bg-surface-strong text-subtle" : "bg-canvas text-accent",
                        ].join(" ")}
                      >
                        {numberFormatter.format(product.stock)} ชิ้น
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        aria-label={`Edit ${product.name}`}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-canvas text-muted transition active:scale-[0.96] [&_svg]:h-4 [&_svg]:w-4"
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
                  <div className="grid grid-cols-3 gap-2 text-[0.7rem] font-bold">
                    <span className="min-w-0 rounded-xl bg-canvas px-2.5 py-2 leading-snug text-muted [overflow-wrap:anywhere]">ทุน {formatMoney(product.costPrice)}</span>
                    <span className="min-w-0 rounded-xl bg-canvas px-2.5 py-2 leading-snug text-muted [overflow-wrap:anywhere]">ขาย {formatMoney(product.salePrice)}</span>
                    <span className={["min-w-0 rounded-xl px-2.5 py-2 leading-snug [overflow-wrap:anywhere]", isLoss ? "bg-[#fff2f0] text-[#b83f28]" : "bg-[#e6f5ef] text-[#287c5d]"].join(" ")}>
                      กำไร {formatMoney(unitProfit)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-[0.74rem] font-extrabold text-muted">
                    <span className="min-w-0 [overflow-wrap:anywhere]">มูลค่าสต๊อก {formatMoney(product.costPrice * product.stock)}</span>
                    <span className={["min-w-0 text-right [overflow-wrap:anywhere]", isLoss ? "text-[#b83f28]" : "text-accent"].join(" ")}>
                      กำไรรวม {formatMoney(totalProfit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white/62 p-5">
            <strong className="block text-[0.96rem] text-ink">No products yet</strong>
            <span className="text-[0.86rem] leading-snug text-muted">เพิ่มสินค้าเพื่อดูต้นทุน ราคาขาย กำไร และสต๊อก</span>
          </div>
        )}
      </section>

      <Sheet
        open={formOpen}
        onClose={closeForm}
        kicker={editingProduct ? "Edit" : "New"}
        title="Product"
        titleId="product-form-title"
      >
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
              placeholder="Name"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
              <span>Cost</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
                className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
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
                className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
                placeholder="0"
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-[0.72rem] font-extrabold text-muted">
            <span>Stock</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="min-h-11.5 rounded-lg border border-line bg-canvas px-3 text-ink"
              placeholder="0"
            />
          </label>
          {error && <p className="mb-0 text-[0.78rem] font-extrabold text-[#b83f28]">{error}</p>}
          <button
            type="submit"
            className="min-h-12.5 rounded-2xl border-0 bg-accent text-sm font-black text-accent-ink transition active:scale-[0.98]"
          >
            {editingProduct ? "Update product" : "Save product"}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={() => deleteProduct(editingProduct)}
              className="flex min-h-12.5 items-center justify-center gap-2 rounded-2xl border border-[#f0c8bd] bg-surface text-sm font-black text-[#b83f28] transition active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
            >
              <TrashIcon />
              Delete product
            </button>
          )}
        </form>
      </Sheet>
    </>
  );
}
