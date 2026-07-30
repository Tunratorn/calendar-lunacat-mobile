import { useEffect, useRef, useState } from "react";
import { monthNames } from "../lib/date";
import { ChevronLeftIcon, ChevronRightIcon, RefreshIcon } from "./icons";

interface MonthSwitcherProps {
  visibleMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (year: number, month: number) => void;
  onGoToCurrent: () => void;
}

export function MonthSwitcher({ visibleMonth, onPrevMonth, onNextMonth, onSelectMonth, onGoToCurrent }: MonthSwitcherProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(String(visibleMonth.getFullYear()));
  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthIndex = visibleMonth.getMonth();

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node) || pickerRef.current?.contains(target)) {
        return;
      }

      setPickerOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [pickerOpen]);

  useEffect(() => {
    if (pickerOpen) {
      setDraftYear(String(visibleYear));
    }
  }, [pickerOpen, visibleYear]);

  const parsedDraftYear = Number(draftYear);
  const selectedYear = Number.isInteger(parsedDraftYear) && parsedDraftYear >= 1 ? parsedDraftYear : visibleYear;

  function selectMonth(year: number, month: number) {
    onSelectMonth(year, month);
    setPickerOpen(false);
  }

  function goToCurrent() {
    onGoToCurrent();
    setPickerOpen(false);
  }

  function shiftDraftYear(offset: number) {
    setDraftYear(String(selectedYear + offset));
  }

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
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          aria-expanded={pickerOpen}
          aria-label="Select month and year"
          onClick={() => setPickerOpen((prev) => !prev)}
          className="rounded-xl border-0 bg-transparent px-3 py-2 text-base font-semibold text-ink transition hover:bg-surface active:scale-[0.98]"
        >
          {monthNames[visibleMonthIndex]} {visibleYear}
        </button>
        {pickerOpen && (
          <div className="absolute left-1/2 top-[calc(100%+8px)] z-30 w-[min(72vw,236px)] -translate-x-1/2 rounded-2xl border border-line bg-surface p-2.5 shadow-[0_18px_46px_rgba(22,32,51,0.18)]">
            <div className="mb-2.5 grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-end gap-1.5">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => shiftDraftYear(-1)}
                className="grid h-8.5 min-w-0 place-items-center rounded-lg bg-canvas text-ink transition active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
              >
                <ChevronLeftIcon />
              </button>
              <label className="grid min-w-0 gap-1 text-center">
                <span className="text-[0.62rem] font-black uppercase text-subtle">Year</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={draftYear}
                  onChange={(event) => setDraftYear(event.target.value)}
                  className="min-h-8.5 min-w-0 rounded-lg border border-line bg-canvas px-1.5 text-center text-[0.82rem] font-black text-ink"
                />
              </label>
              <button
                type="button"
                aria-label="Next year"
                onClick={() => shiftDraftYear(1)}
                className="grid h-8.5 min-w-0 place-items-center rounded-lg bg-canvas text-ink transition active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((monthName, month) => (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => selectMonth(selectedYear, month)}
                  className={[
                    "min-h-9 rounded-xl px-2 text-[0.72rem] font-black transition active:scale-[0.98]",
                    month === visibleMonthIndex && selectedYear === visibleYear ? "bg-accent text-accent-ink" : "bg-canvas text-ink",
                  ].join(" ")}
                >
                  {monthName.slice(0, 3)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={goToCurrent}
              className="mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border-0 bg-accent text-[0.78rem] font-black text-accent-ink transition active:scale-[0.98] [&_svg]:h-4 [&_svg]:w-4"
            >
              <RefreshIcon />
              Current
            </button>
          </div>
        )}
      </div>
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
