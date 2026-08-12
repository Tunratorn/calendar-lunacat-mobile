import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
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
  title: "",
  start: "00:00",
  end: "00:00",
  note: "",
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

interface TimePickerModalProps {
  field: "start" | "end";
  label: string;
  value: string;
  onChangePart: (field: "start" | "end", part: "hour" | "minute", value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function TimePickerModal({ field, label, value, onChangePart, onConfirm, onClose }: TimePickerModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/36 px-5 py-5 animate-backdrop-in max-[460px]:px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${field}-time-picker-title`}
        className="grid h-[min(72dvh,440px)] max-h-[calc(100dvh-2rem)] w-full max-w-[340px] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-[20px] bg-surface p-3.5 shadow-[0_18px_55px_rgba(22,32,51,0.22)]"
        data-time-picker
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-0.5 text-[0.7rem] font-black uppercase text-muted">{label}</p>
            <h3 id={`${field}-time-picker-title`} className="text-lg font-black leading-tight text-ink">
              {value}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-8.5 rounded-lg border-0 bg-surface-strong px-3 text-[0.74rem] font-black text-ink transition active:scale-[0.98]"
          >
            Done
          </button>
        </div>
        <div className="grid min-h-0 grid-cols-2 gap-2.5">
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
            <span className="text-center text-[0.64rem] font-black uppercase text-subtle">Hour</span>
            <div className="grid min-h-0 content-start gap-1 overflow-y-auto overscroll-contain rounded-lg bg-canvas p-1">
              {hourOptions.map((hour) => {
                const selected = getTimePart(value, "hour") === hour;

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => onChangePart(field, "hour", hour)}
                    className={[
                      "min-h-8 rounded-md text-[0.78rem] font-black transition active:scale-[0.98]",
                      selected ? "bg-accent text-accent-ink" : "bg-surface text-ink",
                    ].join(" ")}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
            <span className="text-center text-[0.64rem] font-black uppercase text-subtle">Minute</span>
            <div className="grid min-h-0 content-start gap-1 overflow-y-auto overscroll-contain rounded-lg bg-canvas p-1">
              {minuteOptions.map((minute) => {
                const selected = getTimePart(value, "minute") === minute;

                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => onChangePart(field, "minute", minute)}
                    className={[
                      "min-h-8 rounded-md text-[0.78rem] font-black transition active:scale-[0.98]",
                      selected ? "bg-accent text-accent-ink" : "bg-surface text-ink",
                    ].join(" ")}
                  >
                    {minute}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-10 rounded-xl border-0 bg-accent text-[0.84rem] font-black text-accent-ink transition active:scale-[0.98]"
        >
          Select time
        </button>
      </section>
    </div>,
    document.body,
  );
}

export function EventFormSheet({ open, editingEvent, submitError, onClose, onSave }: EventFormSheetProps) {
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [localError, setLocalError] = useState("");
  const [activeTimePicker, setActiveTimePicker] = useState<"start" | "end" | null>(null);
  const [selectedTimes, setSelectedTimes] = useState({ start: false, end: false });

  useEffect(() => {
    if (!open) {
      return;
    }

    setLocalError("");
    setActiveTimePicker(null);
    setSelectedTimes({ start: Boolean(editingEvent), end: Boolean(editingEvent) });
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

    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.stopPropagation();
      setActiveTimePicker(null);
    }

    document.addEventListener("keydown", handleKeydown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeydown, { capture: true });
  }, [activeTimePicker]);

  const isEditing = Boolean(editingEvent);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!draft.title.trim()) {
      setLocalError("Title is required.");
      return;
    }

    if (!selectedTimes.start || !selectedTimes.end) {
      setLocalError("Start time and end time are required.");
      return;
    }

    const trimmedDraft = { ...draft, title: draft.title.trim(), note: draft.note.trim() };

    if (trimmedDraft.start >= trimmedDraft.end) {
      setLocalError("End time must be later than start time.");
      return;
    }

    setLocalError("");
    setActiveTimePicker(null);
    onSave(trimmedDraft);
  }

  function setTimePart(field: "start" | "end", part: "hour" | "minute", value: string) {
    setDraft((prev) => ({ ...prev, [field]: updateTime(prev[field], part, value) }));
    setSelectedTimes((prev) => ({ ...prev, [field]: true }));
  }

  function confirmTime(field: "start" | "end") {
    setSelectedTimes((prev) => ({ ...prev, [field]: true }));
    setActiveTimePicker(null);
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
          className={[timeButtonClass, selectedTimes[field] ? "text-ink" : "text-subtle"].join(" ")}
        >
          {value}
        </button>
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
      {activeTimePicker && (
        <TimePickerModal
          field={activeTimePicker}
          label={activeTimePicker === "start" ? "Start time" : "End time"}
          value={draft[activeTimePicker]}
          onChangePart={setTimePart}
          onConfirm={() => confirmTime(activeTimePicker)}
          onClose={() => setActiveTimePicker(null)}
        />
      )}
    </Sheet>
  );
}
