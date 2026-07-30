import type { Holiday } from "../types";

interface HolidaySummaryProps {
  holidays: Holiday[];
  selectedHoliday: Holiday | null;
  isManaging: boolean;
  draftCount: number;
  onManage: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function HolidaySummary({
  holidays,
  selectedHoliday,
  isManaging,
  draftCount,
  onManage,
  onCancel,
  onSave,
}: HolidaySummaryProps) {
  const count = isManaging ? draftCount : holidays.length;
  const title = isManaging ? "Select holiday dates" : `${count} holidays this month`;
  const helperText = isManaging
    ? "Tap dates in the calendar, then save."
    : selectedHoliday
      ? selectedHoliday.title
      : "Holiday dates are marked in red.";

  return (
    <section aria-labelledby="holiday-summary-title" className="mx-5 mb-3 rounded-2xl bg-[#fff2f0] px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 text-[0.62rem] font-bold uppercase text-[#b94b41]">Holidays</p>
          <h2 id="holiday-summary-title" className="text-[0.86rem] font-semibold leading-tight text-[#8f2d28]">
            {title}
          </h2>
          <p className="mt-0.5 mb-0 text-[0.72rem] font-semibold leading-snug text-muted [overflow-wrap:anywhere]">
            {helperText}
          </p>
        </div>
        {isManaging ? (
          <div className="grid flex-none gap-1.5">
            <button
              type="button"
              onClick={onSave}
              className="min-h-8 rounded-lg border-0 bg-[#d6453d] px-2.5 text-[0.68rem] font-black text-white shadow-[0_12px_22px_rgba(214,69,61,0.18)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="min-h-8 rounded-lg border border-[#efb4ad] bg-white px-2.5 text-[0.68rem] font-black text-[#b9342d] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        ) : selectedHoliday ? (
          <div className="grid flex-none gap-1.5">
            <button
              type="button"
              onClick={onManage}
              className="min-h-8 rounded-lg border-0 bg-[#d6453d] px-2.5 text-[0.68rem] font-black text-white transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
            >
              Manage
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onManage}
            className="min-h-9 rounded-lg border-0 bg-[#d6453d] px-2.5 text-[0.68rem] font-black text-white shadow-[0_12px_22px_rgba(214,69,61,0.18)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
          >
            Manage
          </button>
        )}
      </div>
    </section>
  );
}
