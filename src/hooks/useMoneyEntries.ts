import { useEffect, useState } from "react";
import type { MoneyEntry } from "../types";

const STORAGE_KEY = "lunacat-money-entries";

function loadStoredMoneyEntries(): MoneyEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as MoneyEntry[];
  } catch {
    return [];
  }
}

export function useMoneyEntries() {
  const [moneyEntries, setMoneyEntries] = useState<MoneyEntry[]>(loadStoredMoneyEntries);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moneyEntries));
  }, [moneyEntries]);

  return { moneyEntries, setMoneyEntries };
}
