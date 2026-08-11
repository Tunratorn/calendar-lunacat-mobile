export type Category = "work" | "personal" | "focus";

export type Filter = "all" | Category;

export type View = "calendar" | "product" | "stats";

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

export type MoneyType = "income" | "expense";

export interface MoneyEntry {
  id: string;
  date: string;
  type: MoneyType;
  amount: number;
  category: string;
  note: string;
}

export interface MoneyDraft {
  type: MoneyType;
  amount: number;
  category: string;
  note: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  salePrice: number;
  stock: number;
}
