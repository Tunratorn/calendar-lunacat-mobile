import { useEffect, useState } from "react";
import type { Holiday } from "../types";

const STORAGE_KEY = "lunacat-holidays";

function loadStoredHolidays(): Holiday[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Holiday[];
  } catch {
    return [];
  }
}

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>(loadStoredHolidays);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  }, [holidays]);

  return { holidays, setHolidays };
}
