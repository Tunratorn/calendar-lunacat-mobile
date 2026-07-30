import { useEffect, useState, type FormEvent } from "react";
import type { MoneyDraft, MoneyEntry, MoneyType } from "../types";
import { Sheet } from "./Sheet";
import { TrashIcon } from "./icons";

interface MoneyFormSheetProps {
  open: boolean;
  editingEntry: MoneyEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (draft: MoneyDraft) => void;
}

const defaultDraft: MoneyDraft = {
  type: "expense",
  amount: 0,
  category: "Food",
  note: "",
};

const inputClass = "min-h-11.5 w-full rounded-lg border border-line bg-canvas px-3 text-ink";
const labelClass = "grid gap-2 text-[0.78rem] font-extrabold text-muted";
const typeOptions: Array<{ value: MoneyType; label: string }> = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const categoryOptions: Record<MoneyType, string[]> = {
  income: ["Salary", "Freelance", "Gift", "Other"],
  expense: ["Food", "Travel", "Shopping", "Bills", "Health", "Other"],
};

export function MoneyFormSheet({ open, editingEntry, onClose, onDelete, onSave }: MoneyFormSheetProps) {
  const [draft, setDraft] = useState<MoneyDraft>(defaultDraft);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setDraft(
      editingEntry
        ? {
            type: editingEntry.type,
            amount: editingEntry.amount,
            category: editingEntry.category,
            note: editingEntry.note,
          }
        : defaultDraft,
    );
  }, [editingEntry, open]);

  function updateType(type: MoneyType) {
    setDraft((prev) => ({
      ...prev,
      type,
      category: categoryOptions[type][0],
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
      setError("Amount must be more than 0.");
      return;
    }

    setError("");
    onSave({ ...draft, amount: Math.round(draft.amount) });
  }

  const isEditing = Boolean(editingEntry);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker={isEditing ? "Edit" : "New"}
      title={isEditing ? "Edit money entry" : "Add money entry"}
      titleId="money-sheet-title"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-canvas p-1.5">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateType(option.value)}
              className={[
                "min-h-10 rounded-xl border-0 text-sm font-black transition active:scale-[0.98]",
                draft.type === option.value
                  ? option.value === "income"
                    ? "bg-[#287c5d] text-white"
                    : "bg-[#d6453d] text-white"
                  : "bg-transparent text-muted",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className={labelClass}>
          <span>Amount</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            required
            value={draft.amount || ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, amount: Number(event.target.value) }))}
            className={inputClass}
            placeholder="0"
          />
        </label>

        <label className={labelClass}>
          <span>Category</span>
          <select
            value={draft.category}
            onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
            className={`${inputClass} font-bold`}
          >
            {categoryOptions[draft.type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span>Note</span>
          <input
            type="text"
            value={draft.note}
            onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
            className={inputClass}
          />
        </label>

        {error && <p className="-mt-1 mb-0 text-[0.82rem] font-extrabold text-[#b83f28]">{error}</p>}

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <button
            type="submit"
            className="min-h-12.5 rounded-2xl border-0 bg-accent font-black text-accent-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          {isEditing && editingEntry && (
            <button
              type="button"
              onClick={() => onDelete(editingEntry.id)}
              className="flex min-h-12.5 items-center justify-center gap-2 rounded-2xl border border-[#f0c8bd] bg-surface px-4 font-black text-[#b83f28] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
            >
              <TrashIcon />
              Delete
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
