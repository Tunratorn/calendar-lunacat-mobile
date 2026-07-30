import { useMemo, useState } from "react";
import type { CalendarEvent, Category, EventDraft, Filter, Holiday, View } from "./types";
import { mockEvents } from "./data/mockEvents";
import { useEvents } from "./hooks/useEvents";
import { useHolidays } from "./hooks/useHolidays";
import { fromDateKey, toDateKey } from "./lib/date";
import { TopBar } from "./components/TopBar";
import { DateHero } from "./components/DateHero";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { CalendarGrid } from "./components/CalendarGrid";
import { AgendaList } from "./components/AgendaList";
import { BottomNav } from "./components/BottomNav";
import { EventFormSheet } from "./components/EventFormSheet";
import { EventDetailSheet } from "./components/EventDetailSheet";
import { MenuSheet } from "./components/MenuSheet";
import { ProfileSheet } from "./components/ProfileSheet";
import { TasksSheet } from "./components/TasksSheet";
import { StatsSheet } from "./components/StatsSheet";
import { HolidaySummary } from "./components/HolidaySummary";

const today = new Date(2026, 6, 8);

type InfoSheetKind = "menu" | "profile" | "tasks" | "stats" | "detail" | null;

export default function App() {
  const { events, setEvents, resetEvents } = useEvents(mockEvents);
  const { holidays, setHolidays } = useHolidays();

  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(toDateKey(today));
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [activeView, setActiveView] = useState<View>("calendar");
  const [holidaySelectionMode, setHolidaySelectionMode] = useState(false);
  const [draftHolidayDates, setDraftHolidayDates] = useState<Set<string>>(() => new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [infoSheet, setInfoSheet] = useState<InfoSheetKind>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDay && (activeFilter === "all" || event.category === activeFilter))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events, selectedDay, activeFilter]);

  const eventCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((event) => {
      counts.set(event.date, (counts.get(event.date) ?? 0) + 1);
    });
    return counts;
  }, [events]);

  const holidayByDate = useMemo(() => {
    const byDate = new Map<string, Holiday>();
    holidays.forEach((holiday) => {
      byDate.set(holiday.date, holiday);
    });
    return byDate;
  }, [holidays]);

  const selectedHoliday = holidayByDate.get(selectedDay) ?? null;

  const monthHolidays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    return holidays
      .filter((holiday) => {
        const date = fromDateKey(holiday.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, visibleMonth]);

  function goToDay(dateKey: string, date: Date) {
    setSelectedDay(dateKey);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function shiftMonth(offset: number) {
    cancelHolidaySelection();
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(next);
    setSelectedDay(toDateKey(next));
  }

  function goToToday() {
    cancelHolidaySelection();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(toDateKey(today));
  }

  function openCreateSheet() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEditSheet(event: CalendarEvent) {
    setInfoSheet(null);
    setEditingEvent(event);
    setFormOpen(true);
  }

  function closeFormSheet() {
    setFormOpen(false);
    setEditingEvent(null);
  }

  function openHolidayManager() {
    setDraftHolidayDates(new Set(monthHolidays.map((holiday) => holiday.date)));
    setHolidaySelectionMode(true);
  }

  function cancelHolidaySelection() {
    setHolidaySelectionMode(false);
    setDraftHolidayDates(new Set());
  }

  function saveEvent(draft: EventDraft) {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((item) => (item.id === editingEvent.id ? { ...item, ...draft } : item)),
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}`,
          date: selectedDay,
          category: activeFilter === "all" ? "work" : activeFilter,
          ...draft,
        },
      ]);
    }

    closeFormSheet();
  }

  function deleteEvent(id: string) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    setEvents((prev) => prev.filter((item) => item.id !== id));
    closeInfoSheet();
  }

  function toggleHolidayDate(dateKey: string) {
    setDraftHolidayDates((prev) => {
      const next = new Set(prev);

      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }

      return next;
    });
  }

  function saveHolidaySelection() {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const draftDates = Array.from(draftHolidayDates).sort();

    setHolidays((prev) => {
      const otherMonthHolidays = prev.filter((holiday) => {
        const date = fromDateKey(holiday.date);
        return date.getFullYear() !== year || date.getMonth() !== month;
      });

      const nextMonthHolidays = draftDates.map((dateKey) => {
        const existing = prev.find((holiday) => holiday.date === dateKey);
        return existing ?? { id: `hol-${dateKey}`, date: dateKey, title: "Holiday" };
      });

      return [...otherMonthHolidays, ...nextMonthHolidays];
    });

    cancelHolidaySelection();
  }

  function deleteSelectedHoliday() {
    if (!selectedHoliday || !window.confirm("Delete this holiday?")) {
      return;
    }

    setHolidays((prev) => prev.filter((holiday) => holiday.id !== selectedHoliday.id));
  }

  function openEventDetail(event: CalendarEvent) {
    setDetailEvent(event);
    setInfoSheet("detail");
  }

  function closeInfoSheet() {
    setInfoSheet(null);
    setDetailEvent(null);
  }

  function selectCategoryFilter(category: Category) {
    setActiveFilter(category);
    setInfoSheet(null);
  }

  function handleResetMockData() {
    resetEvents();
    setActiveFilter("all");
    setInfoSheet(null);
  }

  function openNavView(view: View) {
    setActiveView(view);

    if (view === "tasks" || view === "stats") {
      setInfoSheet(view);
    }
  }

  const sectionRefreshKey = `${selectedDay}|${activeFilter}|${visibleMonth.getTime()}`;

  return (
    <main aria-label="Lunacat calendar app" className="grid min-h-screen place-items-center p-5 max-[460px]:block max-[460px]:p-0">
      <section className="no-scrollbar relative h-[min(880px,calc(100vh-40px))] min-h-190 w-[min(100%,420px)] overflow-y-auto overflow-x-hidden rounded-[36px] border border-ink/10 bg-canvas shadow-[0_24px_70px_rgba(22,32,51,0.16)] max-[460px]:h-screen max-[460px]:min-h-screen max-[460px]:w-full max-[460px]:rounded-none max-[460px]:border-0">
        <TopBar onOpenMenu={() => setInfoSheet("menu")} onOpenProfile={() => setInfoSheet("profile")} />

        <div key={sectionRefreshKey} className="animate-section-refresh">
          <DateHero
            date={fromDateKey(selectedDay)}
            eventCount={dayEvents.length}
            holidayTitle={selectedHoliday?.title}
            onOpenCreateSheet={openCreateSheet}
          />

          <HolidaySummary
            holidays={monthHolidays}
            selectedHoliday={selectedHoliday}
            isManaging={holidaySelectionMode}
            draftCount={draftHolidayDates.size}
            onManage={openHolidayManager}
            onCancel={cancelHolidaySelection}
            onSave={saveHolidaySelection}
            onDeleteSelected={deleteSelectedHoliday}
          />

          <MonthSwitcher
            visibleMonth={visibleMonth}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
          />

          <CalendarGrid
            visibleMonth={visibleMonth}
            selectedDay={selectedDay}
            getEventCount={(dateKey) => eventCountByDate.get(dateKey) ?? 0}
            getHolidayTitle={(dateKey) => holidayByDate.get(dateKey)?.title}
            holidaySelectionMode={holidaySelectionMode}
            isHolidayDraftSelected={(dateKey) => draftHolidayDates.has(dateKey)}
            onSelectDay={goToDay}
            onToggleHolidayDate={toggleHolidayDate}
          />

          <section aria-labelledby="agenda-title" className="px-5 pt-3 pb-26">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="mb-0.5 text-xs font-bold uppercase text-muted">Schedule</p>
                <h2 id="agenda-title" className="text-xl font-semibold text-ink">
                  Upcoming
                </h2>
              </div>
              <button
                type="button"
                onClick={goToToday}
                className="border-0 bg-transparent font-extrabold text-accent"
              >
                Today
              </button>
            </div>
            <AgendaList events={dayEvents} onOpenEvent={openEventDetail} />
          </section>
        </div>

        <BottomNav activeView={activeView} onSelectView={openNavView} />
      </section>

      <EventFormSheet open={formOpen} editingEvent={editingEvent} onClose={closeFormSheet} onSave={saveEvent} />

      <EventDetailSheet
        open={infoSheet === "detail"}
        event={detailEvent}
        onClose={closeInfoSheet}
        onEdit={openEditSheet}
        onDelete={deleteEvent}
      />

      <MenuSheet
        open={infoSheet === "menu"}
        onClose={closeInfoSheet}
        onSelectCategory={selectCategoryFilter}
        onResetMockData={handleResetMockData}
      />

      <ProfileSheet open={infoSheet === "profile"} onClose={closeInfoSheet} />
      <TasksSheet open={infoSheet === "tasks"} onClose={closeInfoSheet} />
      <StatsSheet open={infoSheet === "stats"} onClose={closeInfoSheet} />
    </main>
  );
}
