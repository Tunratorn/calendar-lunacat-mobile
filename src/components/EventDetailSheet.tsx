import type { CalendarEvent } from "../types";
import { monthNames, weekdayNames, fromDateKey, getDuration } from "../lib/date";
import { categoryBorderClass } from "../lib/category";
import { Sheet } from "./Sheet";
import { EditIcon, TrashIcon } from "./icons";

interface EventDetailSheetProps {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function EventDetailSheet({ open, event, onClose, onEdit, onDelete }: EventDetailSheetProps) {
  if (!event) {
    return null;
  }

  const date = fromDateKey(event.date);

  return (
    <Sheet open={open} onClose={onClose} kicker={event.category} title={event.title} titleId="info-title">
      <div className="grid gap-4">
        <div className={`grid gap-2 rounded-2xl border border-line bg-canvas p-4 border-l-[5px] ${categoryBorderClass[event.category]}`}>
          <strong className="text-ink">
            {weekdayNames[date.getDay()]}, {monthNames[date.getMonth()]} {date.getDate()}
          </strong>
          <span className="text-[0.84rem] text-muted">
            {event.start} - {event.end} · {getDuration(event.start, event.end)}
          </span>
          <p className="mb-0 text-[0.84rem] text-muted">{event.note || "No notes"}</p>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Calendar</span>
            <strong className="text-ink">{event.category}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Status</span>
            <strong className="text-ink">Confirmed</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Reminder</span>
            <strong className="text-ink">15 minutes before</strong>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="flex flex-1 min-h-11.5 items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-black text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
          >
            <EditIcon />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(event.id)}
            className="flex flex-1 min-h-11.5 items-center justify-center gap-2 rounded-2xl border border-[#f0c8bd] bg-surface font-black text-[#b83f28] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] [&_svg]:h-4.5 [&_svg]:w-4.5"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>
    </Sheet>
  );
}
