import type { CalendarEvent, EventDraft, Holiday, MoneyDraft, MoneyEntry, Product } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://develop-api-production.up.railway.app/api").replace(/\/$/, "");
const LUNACAT_USER_ID = import.meta.env.VITE_LUNACAT_USER_ID || "08e7c274-8d2a-43c2-8ade-71cee76add92";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-lunacat-user-id": LUNACAT_USER_ID,
      ...options.headers,
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data;
}

export const lunacatApi = {
  getEvents() {
    return request<CalendarEvent[]>("/lunacat/events");
  },
  createEvent(event: EventDraft & Pick<CalendarEvent, "date" | "category">) {
    return request<CalendarEvent>("/lunacat/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  },
  updateEvent(id: string, event: Partial<EventDraft & Pick<CalendarEvent, "date" | "category">>) {
    return request<CalendarEvent>(`/lunacat/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    });
  },
  deleteEvent(id: string) {
    return request<CalendarEvent>(`/lunacat/events/${id}`, {
      method: "DELETE",
    });
  },
  getHolidays() {
    return request<Holiday[]>("/lunacat/holidays");
  },
  replaceHolidays(startDate: string, endDate: string, holidays: Array<Pick<Holiday, "date" | "title">>) {
    return request<Holiday[]>("/lunacat/holidays", {
      method: "PUT",
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        holidays,
      }),
    });
  },
  getMoneyEntries() {
    return request<MoneyEntry[]>("/lunacat/money-entries");
  },
  createMoneyEntry(entry: MoneyDraft & Pick<MoneyEntry, "date">) {
    return request<MoneyEntry>("/lunacat/money-entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },
  updateMoneyEntry(id: string, entry: Partial<MoneyDraft & Pick<MoneyEntry, "date">>) {
    return request<MoneyEntry>(`/lunacat/money-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(entry),
    });
  },
  deleteMoneyEntry(id: string) {
    return request<MoneyEntry>(`/lunacat/money-entries/${id}`, {
      method: "DELETE",
    });
  },
  getProducts() {
    return request<Product[]>("/lunacat/products");
  },
  createProduct(product: Omit<Product, "id">) {
    return request<Product>("/lunacat/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },
  updateProduct(id: string, product: Partial<Omit<Product, "id">>) {
    return request<Product>(`/lunacat/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },
  deleteProduct(id: string) {
    return request<Product>(`/lunacat/products/${id}`, {
      method: "DELETE",
    });
  },
};
