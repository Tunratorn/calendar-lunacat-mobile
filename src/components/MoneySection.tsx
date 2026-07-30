import type { MoneyEntry } from "../types";
import { PlusIcon } from "./icons";

interface MoneySectionProps {
  entries: MoneyEntry[];
  income: number;
  expense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  onOpenCreate: () => void;
  onOpenEntry: (entry: MoneyEntry) => void;
}

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return currencyFormatter.format(value);
}

export function MoneySection({
  entries,
  income,
  expense,
  balance,
  monthIncome,
  monthExpense,
  monthBalance,
  onOpenCreate,
  onOpenEntry,
}: MoneySectionProps) {
  return (
    <section aria-labelledby="money-title" className="px-5 pt-1 pb-26">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="mb-0.5 text-xs font-bold uppercase text-muted">Money</p>
          <h2 id="money-title" className="text-xl font-semibold text-ink">
            Daily cashflow
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border-0 bg-accent px-3 text-xs font-black text-accent-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] [&_svg]:h-4 [&_svg]:w-4"
        >
          <PlusIcon />
          Add
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-[#e6f5ef] p-3">
          <p className="mb-1 text-[0.62rem] font-black uppercase text-[#287c5d]">Income</p>
          <strong className="block text-[0.82rem] leading-tight text-[#176246]">{formatMoney(income)}</strong>
        </div>
        <div className="rounded-2xl bg-[#fff2f0] p-3">
          <p className="mb-1 text-[0.62rem] font-black uppercase text-[#b94b41]">Expense</p>
          <strong className="block text-[0.82rem] leading-tight text-[#9f312b]">{formatMoney(expense)}</strong>
        </div>
        <div className="rounded-2xl bg-surface p-3">
          <p className="mb-1 text-[0.62rem] font-black uppercase text-muted">Balance</p>
          <strong className={["block text-[0.82rem] leading-tight", balance < 0 ? "text-[#b83f28]" : "text-ink"].join(" ")}>
            {formatMoney(balance)}
          </strong>
        </div>
      </div>

      <div className="mb-3 rounded-2xl bg-surface p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="mb-0 text-[0.64rem] font-black uppercase text-muted">Monthly summary</p>
          <strong className={["text-[0.8rem]", monthBalance < 0 ? "text-[#b83f28]" : "text-ink"].join(" ")}>
            {formatMoney(monthBalance)}
          </strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[0.72rem] font-bold">
          <span className="text-[#287c5d]">Income {formatMoney(monthIncome)}</span>
          <span className="text-right text-[#b83f28]">Expense {formatMoney(monthExpense)}</span>
        </div>
      </div>

      {entries.length ? (
        <div className="relative">
          <div className="absolute bottom-6 left-[4.15rem] top-6 w-px bg-line" aria-hidden="true" />
          {entries.map((entry, index) => {
            const isIncome = entry.type === "income";

            return (
              <div
                key={entry.id}
                className="relative grid grid-cols-[3.45rem_1.4rem_1fr] gap-2.5 pb-3 last:pb-0 animate-item-rise"
              >
                <span
                  className={[
                    "pt-3 text-right text-[0.68rem] font-black uppercase leading-tight",
                    isIncome ? "text-[#287c5d]" : "text-[#b83f28]",
                  ].join(" ")}
                >
                  {isIncome ? "In" : "Out"}
                </span>
                <div className="relative grid justify-items-center pt-3">
                  <span
                    className={[
                      "relative z-10 h-3.5 w-3.5 rounded-full border-[3px] border-surface shadow-[0_0_0_1px_rgba(22,32,51,0.08)]",
                      isIncome ? "bg-[#287c5d]" : "bg-[#d6453d]",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  {index < entries.length - 1 && <span className="mt-1 h-full min-h-10 w-px bg-line" aria-hidden="true" />}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenEntry(entry)}
                  className="min-w-0 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left shadow-[0_10px_24px_rgba(22,32,51,0.05)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-[0.9rem] font-bold leading-tight text-ink [overflow-wrap:anywhere]">
                      {entry.category}
                    </h3>
                    <strong
                      className={[
                        "flex-none rounded-lg px-2 py-1 text-[0.7rem] font-black leading-none",
                        isIncome ? "bg-[#e6f5ef] text-[#287c5d]" : "bg-[#fff2f0] text-[#b83f28]",
                      ].join(" ")}
                    >
                      {isIncome ? "+" : "-"}
                      {formatMoney(entry.amount)}
                    </strong>
                  </div>
                  <p className="mb-0 text-[0.76rem] font-semibold leading-snug text-muted [overflow-wrap:anywhere]">
                    {entry.note || "No notes"}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white/62 p-4">
          <strong className="block text-[0.9rem] text-ink">No money entries</strong>
          <span className="text-[0.8rem] leading-snug text-muted">Add income or expense for this date.</span>
        </div>
      )}
    </section>
  );
}
