import { monthNames, toDateKey } from "../lib/date";

interface CalendarGridProps {
  visibleMonth: Date;
  selectedDay: string;
  getEventCount: (dateKey: string) => number;
  getHolidayTitle: (dateKey: string) => string | undefined;
  holidaySelectionMode: boolean;
  isHolidayDraftSelected: (dateKey: string) => boolean;
  onSelectDay: (dateKey: string, date: Date) => void;
  onToggleHolidayDate: (dateKey: string) => void;
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({
  visibleMonth,
  selectedDay,
  getEventCount,
  getHolidayTitle,
  holidaySelectionMode,
  isHolidayDraftSelected,
  onSelectDay,
  onToggleHolidayDate,
}: CalendarGridProps) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });

  return (
    <section aria-label="Monthly calendar" className="mx-5 rounded-3xl bg-surface p-4">
      <div className="mb-3 grid grid-cols-7 gap-2" aria-hidden="true">
        {weekdayLabels.map((label) => (
          <span key={label} className="text-center text-[0.68rem] font-extrabold text-subtle">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 [grid-auto-rows:38px]">
        {days.map((date) => {
          const dateKey = toDateKey(date);
          const isCurrentMonth = date.getMonth() === month;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSelected = dateKey === selectedDay;
          const eventCount = getEventCount(dateKey);
          const hasEvent = eventCount > 0;
          const holidayTitle = getHolidayTitle(dateKey);
          const isDraftHoliday = isHolidayDraftSelected(dateKey);
          const isHoliday = holidaySelectionMode ? isDraftHoliday : Boolean(holidayTitle);
          const isDisabled = holidaySelectionMode && !isCurrentMonth;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                if (holidaySelectionMode) {
                  if (isCurrentMonth) {
                    onToggleHolidayDate(dateKey);
                  }
                  return;
                }

                onSelectDay(dateKey, date);
              }}
              disabled={isDisabled}
              aria-pressed={holidaySelectionMode ? isHoliday : undefined}
              aria-current={!holidaySelectionMode && isSelected ? "date" : undefined}
              aria-label={`${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}${
                hasEvent ? `, ${eventCount} events` : ""
              }${isHoliday ? `, holiday${holidayTitle ? `: ${holidayTitle}` : ""}` : ""}`}
              className={[
                "relative grid min-w-0 place-items-center rounded-lg text-sm font-bold transition hover:-translate-y-px hover:scale-[1.04] hover:shadow-[0_8px_18px_rgba(22,32,51,0.08)] active:translate-y-px active:scale-[0.98]",
                isHoliday
                  ? isSelected
                    ? "animate-soft-pop bg-[#d6453d] text-white"
                    : "bg-[#fde8e5] text-[#b7342d] ring-1 ring-[#efb4ad]"
                  : isSelected
                    ? "animate-soft-pop bg-accent text-accent-ink"
                    : hasEvent
                      ? "bg-[#e5efed] text-accent"
                      : isWeekend
                        ? "bg-surface-strong text-ink"
                        : "bg-transparent text-ink",
                holidaySelectionMode && isCurrentMonth && !isHoliday ? "ring-1 ring-dashed ring-[#efb4ad]" : "",
                isDisabled ? "cursor-not-allowed opacity-30 hover:translate-y-0 hover:scale-100 hover:shadow-none" : "",
                !isCurrentMonth && !isSelected ? "text-subtle" : "",
              ].join(" ")}
            >
              <span className="leading-none">{date.getDate()}</span>
              {isHoliday && (
                <span
                  className={[
                    "absolute bottom-0.5 h-1.25 w-1.25 rounded-full",
                    isSelected ? "bg-white" : "bg-[#d6453d]",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
              {hasEvent && (
                <span
                  className={[
                    "absolute inset-1 rounded-lg pointer-events-none",
                    isSelected || isHoliday ? "" : "border border-accent/28",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
              {hasEvent && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral text-[0.62rem] font-black leading-none text-white">
                  {eventCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
