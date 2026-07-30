import type { CalendarEvent } from "../types";
import { getDuration } from "../lib/date";
import { categoryBorderClass } from "../lib/category";

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
    <div>
      {events.map((event) => (
        <button
          key={event.id}
          type="button"
          aria-label={`Open ${event.title} details`}
          onClick={() => onOpenEvent(event)}
          className={[
            "relative mb-3 flex min-h-19.5 w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left text-ink border-l-[5px] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] animate-item-rise",
            categoryBorderClass[event.category],
          ].join(" ")}
        >
          <time dateTime={`${event.date}T${event.start}`} className="flex-none basis-13 text-[0.86rem] font-black text-ink">
            {event.start}
          </time>
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 text-[0.98rem] font-semibold leading-tight text-ink">{event.title}</h3>
            <p className="mb-0 text-[0.86rem] leading-snug text-muted [overflow-wrap:anywhere]">
              {event.note || "No notes"}
            </p>
          </div>
          <span className="flex-none text-[0.78rem] font-extrabold text-subtle">
            {getDuration(event.start, event.end)}
          </span>
        </button>
      ))}
    </div>
  );
}
