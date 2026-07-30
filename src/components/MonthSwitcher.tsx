import { monthNames } from "../lib/date";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface MonthSwitcherProps {
  visibleMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthSwitcher({ visibleMonth, onPrevMonth, onNextMonth }: MonthSwitcherProps) {
  return (
    <nav aria-label="Month navigation" className="flex items-center justify-between px-5 pb-4">
      <button
        type="button"
        aria-label="Previous month"
        onClick={onPrevMonth}
        className="grid h-9.5 w-9.5 flex-none place-items-center rounded-lg bg-surface text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
      >
        <ChevronLeftIcon />
      </button>
      <strong className="text-base font-semibold text-ink">
        {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
      </strong>
      <button
        type="button"
        aria-label="Next month"
        onClick={onNextMonth}
        className="grid h-9.5 w-9.5 flex-none place-items-center rounded-lg bg-surface text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
}
