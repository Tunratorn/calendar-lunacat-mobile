import type { CalendarEvent } from "../types";
import { getDuration } from "../lib/date";
import { categoryDotClass } from "../lib/category";

interface AgendaListProps {
  events: CalendarEvent[];
  onOpenEvent: (event: CalendarEvent) => void;
}

export function AgendaList({ events, onOpenEvent }: AgendaListProps) {
  if (!events.length) {
    return (
      <div className="grid gap-1 rounded-2xl border border-dashed border-line bg-white/62 p-5 animate-item-rise">
        <strong className="text-[0.96rem] text-ink">No events found</strong>
        <span className="text-[0.86rem] leading-snug text-muted">
          Try another filter or create a new event for this date.
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-6 left-[4.15rem] top-6 w-px bg-line" aria-hidden="true" />
      {events.map((event, index) => (
        <div key={event.id} className="relative grid grid-cols-[3.45rem_1.4rem_1fr] gap-2.5 pb-3 last:pb-0 animate-item-rise">
          <time
            dateTime={`${event.date}T${event.start}`}
            className="pt-3 text-right text-[0.76rem] font-black leading-tight text-ink"
          >
            {event.start}
          </time>
          <div className="relative grid justify-items-center pt-3">
            <span
              className={[
                "relative z-10 h-3.5 w-3.5 rounded-full border-[3px] border-surface shadow-[0_0_0_1px_rgba(22,32,51,0.08)]",
                categoryDotClass[event.category],
              ].join(" ")}
              aria-hidden="true"
            />
            {index < events.length - 1 && <span className="mt-1 h-full min-h-10 w-px bg-line" aria-hidden="true" />}
          </div>
          <button
            type="button"
            aria-label={`Open ${event.title} details`}
            onClick={() => onOpenEvent(event)}
            className="min-w-0 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left text-ink shadow-[0_10px_24px_rgba(22,32,51,0.05)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-[0.92rem] font-semibold leading-tight text-ink [overflow-wrap:anywhere]">
                {event.title}
              </h3>
              <span className="flex-none rounded-lg bg-surface-strong px-2 py-1 text-[0.68rem] font-black leading-none text-subtle">
                {getDuration(event.start, event.end)}
              </span>
            </div>
            <p className="mb-0 text-[0.78rem] leading-snug text-muted [overflow-wrap:anywhere]">
              {event.note || "No notes"}
            </p>
          </button>
        </div>
      ))}
    </div>
  );
}
