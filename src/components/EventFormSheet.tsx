import { useEffect, useState, type FormEvent } from "react";
import { Sheet } from "./Sheet";
import type { CalendarEvent, EventDraft } from "../types";

interface EventFormSheetProps {
  open: boolean;
  editingEvent: CalendarEvent | null;
  onClose: () => void;
  onSave: (draft: EventDraft) => void;
}

const defaultDraft: EventDraft = {
  title: "Planning session",
  start: "16:30",
  end: "17:15",
  note: "Discuss next sprint",
};

const inputClass = "min-h-11.5 w-full rounded-lg border border-line bg-canvas px-3 text-ink";
const labelClass = "grid gap-2 text-[0.78rem] font-extrabold text-muted";

export function EventFormSheet({ open, editingEvent, onClose, onSave }: EventFormSheetProps) {
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setHasError(false);
    setDraft(
      editingEvent
        ? { title: editingEvent.title, start: editingEvent.start, end: editingEvent.end, note: editingEvent.note }
        : defaultDraft,
    );
  }, [open, editingEvent]);

  const isEditing = Boolean(editingEvent);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (draft.start >= draft.end) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSave(draft);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker={isEditing ? "Edit" : "New"}
      title={isEditing ? "Edit event" : "Create event"}
      titleId="sheet-title"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className={labelClass}>
          <span>Title</span>
          <input
            type="text"
            required
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            className={inputClass}
          />
        </label>
        <div className="flex items-center gap-3">
          <label className={`w-1/2 ${labelClass}`}>
            <span>Start</span>
            <input
              type="time"
              required
              value={draft.start}
              onChange={(event) => setDraft((prev) => ({ ...prev, start: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className={`w-1/2 ${labelClass}`}>
            <span>End</span>
            <input
              type="time"
              required
              value={draft.end}
              onChange={(event) => setDraft((prev) => ({ ...prev, end: event.target.value }))}
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          <span>Note</span>
          <input
            type="text"
            value={draft.note}
            onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
            className={inputClass}
          />
        </label>
        {hasError && (
          <p className="-mt-1 mb-0 text-[0.82rem] font-extrabold text-[#b83f28]">
            End time must be later than start time.
          </p>
        )}
        <button
          type="submit"
          className="min-h-12.5 rounded-2xl border-0 bg-accent font-black text-accent-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
        >
          {isEditing ? "Update event" : "Save event"}
        </button>
      </form>
    </Sheet>
  );
}
