import { monthNames, toDateKey } from "../lib/date";

interface CalendarGridProps {
  visibleMonth: Date;
  selectedDay: string;
  getEventCount: (dateKey: string) => number;
  onSelectDay: (dateKey: string, date: Date) => void;
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({ visibleMonth, selectedDay, getEventCount, onSelectDay }: CalendarGridProps) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  const days = Array.from({ length: 35 }, (_, index) => {
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

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDay(dateKey, date)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}${
                hasEvent ? `, ${eventCount} events` : ""
              }`}
              className={[
                "relative grid min-w-0 place-items-center rounded-lg text-sm font-bold transition hover:-translate-y-px hover:scale-[1.04] hover:shadow-[0_8px_18px_rgba(22,32,51,0.08)] active:translate-y-px active:scale-[0.98]",
                isSelected
                  ? "animate-soft-pop bg-accent text-accent-ink"
                  : hasEvent
                    ? "bg-[#e5efed] text-accent"
                    : isWeekend
                      ? "bg-surface-strong text-ink"
                      : "bg-transparent text-ink",
                !isCurrentMonth && !isSelected ? "text-subtle" : "",
              ].join(" ")}
            >
              <span className="leading-none">{date.getDate()}</span>
              {hasEvent && (
                <span
                  className={[
                    "absolute inset-1 rounded-lg pointer-events-none",
                    isSelected ? "" : "border border-accent/28",
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
