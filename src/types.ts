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
