import { useEffect, useState } from "react";
import type { CalendarEvent, EventDraft } from "../types";
import { lunacatApi } from "../lib/lunacatApi";

export function useEvents(initialEvents: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        const data = await lunacatApi.getEvents();
        if (active) setEvents(data);
      } catch (eventError) {
        if (active) {
          setError(eventError instanceof Error ? eventError.message : "Unable to load events");
          setEvents(initialEvents);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [initialEvents]);

  async function createEvent(event: EventDraft & Pick<CalendarEvent, "date" | "category">) {
    const created = await lunacatApi.createEvent(event);
    setEvents((prev) => [...prev, created]);
    return created;
  }

  async function updateEvent(id: string, event: Partial<EventDraft & Pick<CalendarEvent, "date" | "category">>) {
    const updated = await lunacatApi.updateEvent(id, event);
    setEvents((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  async function deleteEvent(id: string) {
    await lunacatApi.deleteEvent(id);
    setEvents((prev) => prev.filter((item) => item.id !== id));
  }

  function resetEvents() {
    setEvents(initialEvents);
  }

  return { events, loading, error, createEvent, updateEvent, deleteEvent, resetEvents };
}
