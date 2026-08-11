import { useMemo, useRef, useState } from "react";
import type { CalendarEvent, Category, EventDraft, Filter, Holiday, MoneyDraft, MoneyEntry, View } from "./types";
import { mockEvents } from "./data/mockEvents";
import { useEvents } from "./hooks/useEvents";
import { useHolidays } from "./hooks/useHolidays";
import { useMoneyEntries } from "./hooks/useMoneyEntries";
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
import { ProductPage } from "./components/ProductPage";
import { HolidaySummary } from "./components/HolidaySummary";
import { MoneySection } from "./components/MoneySection";
import { MoneyFormSheet } from "./components/MoneyFormSheet";
import { RefreshIcon } from "./components/icons";

const today = new Date();

type InfoSheetKind = "menu" | "profile" | "detail" | null;

export default function App() {
  const appShellRef = useRef<HTMLDivElement>(null);
  const { events, createEvent, updateEvent, deleteEvent: removeEvent, resetEvents } = useEvents(mockEvents);
  const { holidays, replaceHolidays } = useHolidays();
  const { moneyEntries, createMoneyEntry, updateMoneyEntry, deleteMoneyEntry: removeMoneyEntry } = useMoneyEntries();

  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(toDateKey(today));
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [activeView, setActiveView] = useState<View>("calendar");
  const [holidaySelectionMode, setHolidaySelectionMode] = useState(false);
  const [draftHolidayDates, setDraftHolidayDates] = useState<Set<string>>(() => new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventFormError, setEventFormError] = useState("");
  const [moneyFormOpen, setMoneyFormOpen] = useState(false);
  const [editingMoneyEntry, setEditingMoneyEntry] = useState<MoneyEntry | null>(null);

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

  const dayMoneyEntries = useMemo(() => {
    return moneyEntries.filter((entry) => entry.date === selectedDay);
  }, [moneyEntries, selectedDay]);

  const dayMoneySummary = useMemo(() => {
    return dayMoneyEntries.reduce(
      (summary, entry) => {
        if (entry.type === "income") {
          summary.income += entry.amount;
        } else {
          summary.expense += entry.amount;
        }

        summary.balance = summary.income - summary.expense;
        return summary;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [dayMoneyEntries]);

  const monthMoneySummary = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    return moneyEntries.reduce(
      (summary, entry) => {
        const date = fromDateKey(entry.date);

        if (date.getFullYear() !== year || date.getMonth() !== month) {
          return summary;
        }

        if (entry.type === "income") {
          summary.income += entry.amount;
        } else {
          summary.expense += entry.amount;
        }

        summary.balance = summary.income - summary.expense;
        return summary;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [moneyEntries, visibleMonth]);

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

  function selectVisibleMonth(year: number, month: number) {
    cancelHolidaySelection();
    const next = new Date(year, month, 1);
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
    setEventFormError("");
    setFormOpen(true);
  }

  function openEditSheet(event: CalendarEvent) {
    setInfoSheet(null);
    setEditingEvent(event);
    setEventFormError("");
    setFormOpen(true);
  }

  function closeFormSheet() {
    setFormOpen(false);
    setEditingEvent(null);
    setEventFormError("");
  }

  function openCreateMoneySheet() {
    setEditingMoneyEntry(null);
    setMoneyFormOpen(true);
  }

  function openEditMoneySheet(entry: MoneyEntry) {
    setEditingMoneyEntry(entry);
    setMoneyFormOpen(true);
  }

  function closeMoneyFormSheet() {
    setMoneyFormOpen(false);
    setEditingMoneyEntry(null);
  }

  function openHolidayManager() {
    setDraftHolidayDates(new Set(monthHolidays.map((holiday) => holiday.date)));
    setHolidaySelectionMode(true);
  }

  function cancelHolidaySelection() {
    setHolidaySelectionMode(false);
    setDraftHolidayDates(new Set());
  }

  async function saveEvent(draft: EventDraft) {
    const eventDate = editingEvent?.date ?? selectedDay;
    const duplicateStartEvent = events.find((event) => {
      if (event.date !== eventDate || event.id === editingEvent?.id) {
        return false;
      }

      return event.start === draft.start;
    });

    if (duplicateStartEvent) {
      setEventFormError(`Start time already used by ${duplicateStartEvent.title} (${duplicateStartEvent.start}).`);
      return;
    }

    setEventFormError("");

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, draft);
      } else {
        await createEvent({
          date: selectedDay,
          category: activeFilter === "all" ? "work" : activeFilter,
          ...draft,
        });
      }

      closeFormSheet();
    } catch (saveError) {
      setEventFormError(saveError instanceof Error ? saveError.message : "Unable to save event.");
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    try {
      await removeEvent(id);
      closeInfoSheet();
    } catch (deleteError) {
      setEventFormError(deleteError instanceof Error ? deleteError.message : "Unable to delete event.");
    }
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

  async function saveHolidaySelection() {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const draftDates = Array.from(draftHolidayDates).sort();
    const startDate = toDateKey(new Date(year, month, 1));
    const endDate = toDateKey(new Date(year, month + 1, 0));
    const nextMonthHolidays = draftDates.map((dateKey) => {
      const existing = holidays.find((holiday) => holiday.date === dateKey);
      return existing ?? { id: `hol-${dateKey}`, date: dateKey, title: "Holiday" };
    });

    try {
      await replaceHolidays(startDate, endDate, nextMonthHolidays);
      cancelHolidaySelection();
    } catch (holidayError) {
      window.alert(holidayError instanceof Error ? holidayError.message : "Unable to save holidays.");
    }
  }

  async function saveMoneyEntry(draft: MoneyDraft) {
    try {
      if (editingMoneyEntry) {
        await updateMoneyEntry(editingMoneyEntry.id, draft);
      } else {
        await createMoneyEntry({
          date: selectedDay,
          ...draft,
        });
      }

      closeMoneyFormSheet();
    } catch (moneyError) {
      window.alert(moneyError instanceof Error ? moneyError.message : "Unable to save money entry.");
    }
  }

  async function deleteMoneyEntry(id: string) {
    if (!window.confirm("Delete this money entry?")) {
      return;
    }

    try {
      await removeMoneyEntry(id);
      closeMoneyFormSheet();
    } catch (moneyError) {
      window.alert(moneyError instanceof Error ? moneyError.message : "Unable to delete money entry.");
    }
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
    setDetailEvent(null);
    setInfoSheet(null);
    appShellRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    if (view !== "calendar") {
      cancelHolidaySelection();
    }
  }

  const sectionRefreshKey = `${selectedDay}|${activeFilter}|${visibleMonth.getTime()}`;
  const pageTitleByView: Record<View, string> = {
    calendar: "My Calendar",
    product: "Products",
  };

  return (
    <main aria-label="Lunacat calendar app" className="grid min-h-screen place-items-center p-5 max-[460px]:block max-[460px]:p-0">
      <section className="relative h-[min(880px,calc(100vh-40px))] min-h-190 w-[min(100%,420px)] overflow-hidden rounded-[36px] border border-ink/10 bg-canvas shadow-[0_24px_70px_rgba(22,32,51,0.16)] max-[460px]:h-screen max-[460px]:min-h-screen max-[460px]:w-full max-[460px]:rounded-none max-[460px]:border-0">
        <div ref={appShellRef} className="no-scrollbar h-full overflow-y-auto overflow-x-hidden pb-24">
          <TopBar
            title={pageTitleByView[activeView]}
            onOpenMenu={() => setInfoSheet("menu")}
            onOpenProfile={() => setInfoSheet("profile")}
          />

          {activeView === "product" ? (
            <ProductPage />
          ) : (
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
              />

              <MonthSwitcher
                visibleMonth={visibleMonth}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                onSelectMonth={selectVisibleMonth}
                onGoToCurrent={goToToday}
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

              <section aria-labelledby="agenda-title" className="px-5 pt-3 pb-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-0.5 text-xs font-bold uppercase text-muted">Schedule</p>
                    <h2 id="agenda-title" className="text-xl font-semibold text-ink">
                      Pipeline for {fromDateKey(selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={goToToday}
                    className="flex items-center gap-1.5 border-0 bg-transparent font-extrabold text-accent [&_svg]:h-4 [&_svg]:w-4"
                  >
                    <RefreshIcon />
                    Today
                  </button>
                </div>
                <AgendaList events={dayEvents} onOpenEvent={openEventDetail} />
              </section>

              <MoneySection
                entries={dayMoneyEntries}
                income={dayMoneySummary.income}
                expense={dayMoneySummary.expense}
                balance={dayMoneySummary.balance}
                monthIncome={monthMoneySummary.income}
                monthExpense={monthMoneySummary.expense}
                monthBalance={monthMoneySummary.balance}
                onOpenCreate={openCreateMoneySheet}
                onOpenEntry={openEditMoneySheet}
              />
            </div>
          )}
        </div>

        <BottomNav activeView={activeView} onSelectView={openNavView} />
      </section>

      <EventFormSheet
        open={formOpen}
        editingEvent={editingEvent}
        submitError={eventFormError}
        onClose={closeFormSheet}
        onSave={saveEvent}
      />

      <MoneyFormSheet
        open={moneyFormOpen}
        editingEntry={editingMoneyEntry}
        onClose={closeMoneyFormSheet}
        onDelete={deleteMoneyEntry}
        onSave={saveMoneyEntry}
      />

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
    </main>
  );
}
