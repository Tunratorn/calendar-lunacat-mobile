import { useEffect, useState, type FormEvent } from "react";
import { Sheet } from "./Sheet";
import type { CalendarEvent, EventDraft } from "../types";

interface EventFormSheetProps {
  open: boolean;
  editingEvent: CalendarEvent | null;
  submitError: string;
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
const timeButtonClass = `${inputClass} flex items-center justify-center font-black`;
const labelClass = "grid gap-2 text-[0.78rem] font-extrabold text-muted";

const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

function getTimePart(time: string, part: "hour" | "minute") {
  const [hour = "00", minute = "00"] = time.split(":");
  return part === "hour" ? hour : minute;
}

function updateTime(time: string, part: "hour" | "minute", value: string) {
  const hour = getTimePart(time, "hour");
  const minute = getTimePart(time, "minute");
  return part === "hour" ? `${value}:${minute}` : `${hour}:${value}`;
}

export function EventFormSheet({ open, editingEvent, submitError, onClose, onSave }: EventFormSheetProps) {
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [localError, setLocalError] = useState("");
  const [activeTimePicker, setActiveTimePicker] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLocalError("");
    setActiveTimePicker(null);
    setDraft(
      editingEvent
        ? { title: editingEvent.title, start: editingEvent.start, end: editingEvent.end, note: editingEvent.note }
        : defaultDraft,
    );
  }, [open, editingEvent]);

  useEffect(() => {
    if (!activeTimePicker) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest("[data-time-picker]")) {
        return;
      }

      setActiveTimePicker(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeTimePicker]);

  const isEditing = Boolean(editingEvent);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (draft.start >= draft.end) {
      setLocalError("End time must be later than start time.");
      return;
    }

    setLocalError("");
    setActiveTimePicker(null);
    onSave(draft);
  }

  function setTimePart(field: "start" | "end", part: "hour" | "minute", value: string) {
    setDraft((prev) => ({ ...prev, [field]: updateTime(prev[field], part, value) }));
  }

  function renderTimePicker(field: "start" | "end", label: string) {
    const value = draft[field];
    const active = activeTimePicker === field;

    return (
      <div className={`${labelClass} relative`} data-time-picker>
        <span>{label}</span>
        <button
          type="button"
          aria-expanded={active}
          onClick={() => setActiveTimePicker((prev) => (prev === field ? null : field))}
          className={timeButtonClass}
        >
          {value}
        </button>
        {active && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-2xl border border-line bg-surface p-2 shadow-[0_18px_42px_rgba(22,32,51,0.18)]">
            <div className="mb-2 grid grid-cols-2 gap-2 px-1 text-center text-[0.64rem] font-black uppercase text-subtle">
              <span>Hour</span>
              <span>Minute</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid max-h-38 gap-1 overflow-y-auto pr-1">
                {hourOptions.map((hour) => {
                  const selected = getTimePart(value, "hour") === hour;

                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setTimePart(field, "hour", hour)}
                      className={[
                        "min-h-8 rounded-lg text-[0.78rem] font-black transition active:scale-[0.98]",
                        selected ? "bg-accent text-accent-ink" : "bg-canvas text-ink",
                      ].join(" ")}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
              <div className="grid max-h-38 gap-1 overflow-y-auto pl-1">
                {minuteOptions.map((minute) => {
                  const selected = getTimePart(value, "minute") === minute;

                  return (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => setTimePart(field, "minute", minute)}
                      className={[
                        "min-h-8 rounded-lg text-[0.78rem] font-black transition active:scale-[0.98]",
                        selected ? "bg-accent text-accent-ink" : "bg-canvas text-ink",
                      ].join(" ")}
                    >
                      {minute}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTimePicker(null)}
              className="mt-2 min-h-8 w-full rounded-lg border-0 bg-surface-strong text-[0.72rem] font-black text-ink transition active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
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
        <div className="grid grid-cols-2 gap-3">
          {renderTimePicker("start", "Start time")}
          {renderTimePicker("end", "End time")}
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
        {(localError || submitError) && (
          <p className="-mt-1 mb-0 text-[0.82rem] font-extrabold text-[#b83f28]">
            {localError || submitError}
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
