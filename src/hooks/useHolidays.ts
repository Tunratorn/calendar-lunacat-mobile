import { useEffect, useState } from "react";
import type { Holiday } from "../types";
import { lunacatApi } from "../lib/lunacatApi";

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHolidays() {
      try {
        setLoading(true);
        const data = await lunacatApi.getHolidays();
        if (active) setHolidays(data);
      } catch (holidayError) {
        if (active) setError(holidayError instanceof Error ? holidayError.message : "Unable to load holidays");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHolidays();

    return () => {
      active = false;
    };
  }, []);

  async function replaceHolidays(startDate: string, endDate: string, nextHolidays: Holiday[]) {
    const savedHolidays = await lunacatApi.replaceHolidays(
      startDate,
      endDate,
      nextHolidays.map((holiday) => ({ date: holiday.date, title: holiday.title })),
    );

    setHolidays((prev) => [
      ...prev.filter((holiday) => holiday.date < startDate || holiday.date > endDate),
      ...savedHolidays,
    ]);

    return savedHolidays;
  }

  return { holidays, loading, error, replaceHolidays };
}
