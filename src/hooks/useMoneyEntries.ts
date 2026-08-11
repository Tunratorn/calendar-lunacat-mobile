import { useEffect, useState } from "react";
import type { MoneyDraft, MoneyEntry } from "../types";
import { lunacatApi } from "../lib/lunacatApi";

export function useMoneyEntries() {
  const [moneyEntries, setMoneyEntries] = useState<MoneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMoneyEntries() {
      try {
        setLoading(true);
        const data = await lunacatApi.getMoneyEntries();
        if (active) setMoneyEntries(data);
      } catch (moneyError) {
        if (active) setError(moneyError instanceof Error ? moneyError.message : "Unable to load money entries");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMoneyEntries();

    return () => {
      active = false;
    };
  }, []);

  async function createMoneyEntry(entry: MoneyDraft & Pick<MoneyEntry, "date">) {
    const created = await lunacatApi.createMoneyEntry(entry);
    setMoneyEntries((prev) => [...prev, created]);
    return created;
  }

  async function updateMoneyEntry(id: string, entry: Partial<MoneyDraft & Pick<MoneyEntry, "date">>) {
    const updated = await lunacatApi.updateMoneyEntry(id, entry);
    setMoneyEntries((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  async function deleteMoneyEntry(id: string) {
    await lunacatApi.deleteMoneyEntry(id);
    setMoneyEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return { moneyEntries, loading, error, createMoneyEntry, updateMoneyEntry, deleteMoneyEntry };
}
