export type Category = "work" | "personal" | "focus";

export type Filter = "all" | Category;

export type View = "calendar" | "tasks" | "stats";

export interface CalendarEvent {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  note: string;
  category: Category;
}

export interface EventDraft {
  title: string;
  start: string;
  end: string;
  note: string;
}

export interface Holiday {
  id: string;
  date: string;
  title: string;
}

export interface HolidayDraft {
  title: string;
}
