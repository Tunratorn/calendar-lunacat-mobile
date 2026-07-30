import type { Category } from "../types";
import { categoryDotClass } from "../lib/category";
import { Sheet } from "./Sheet";

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  onResetMockData: () => void;
}

const rows: { category: Category; label: string; description: string }[] = [
  { category: "work", label: "Work", description: "Product meetings and reviews" },
  { category: "personal", label: "Personal", description: "Health, friends, and errands" },
  { category: "focus", label: "Focus", description: "Protected deep work blocks" },
];

export function MenuSheet({ open, onClose, onSelectCategory, onResetMockData }: MenuSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} kicker="Menu" title="My Calendars" titleId="info-title" variant="top">
      <div className="grid gap-3">
        {rows.map((row) => (
          <button
            key={row.category}
            type="button"
            onClick={() => onSelectCategory(row.category)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-canvas p-4 text-left text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
          >
            <span className={`h-3.5 w-3.5 flex-none rounded-full ${categoryDotClass[row.category]}`} />
            <span className="grid gap-0.5">
              <strong>{row.label}</strong>
              <small className="text-[0.84rem] text-muted">{row.description}</small>
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={onResetMockData}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-canvas p-4 text-left text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
        >
          <span className="h-3.5 w-3.5 flex-none rounded-full bg-[#243447]" />
          <span className="grid gap-0.5">
            <strong>Reset mock data</strong>
            <small className="text-[0.84rem] text-muted">Clear local events and reload defaults</small>
          </span>
        </button>
      </div>
    </Sheet>
  );
}
