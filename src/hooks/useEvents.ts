import { useEffect, useState } from "react";
import type { CalendarEvent } from "../types";

const STORAGE_KEY = "lunacat-events";

function loadStoredEvents(fallback: CalendarEvent[]): CalendarEvent[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as CalendarEvent[];
  } catch {
    return fallback;
  }
}

export function useEvents(initialEvents: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadStoredEvents(initialEvents));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  function resetEvents() {
    localStorage.removeItem(STORAGE_KEY);
    setEvents(initialEvents);
  }

  return { events, setEvents, resetEvents };
}
