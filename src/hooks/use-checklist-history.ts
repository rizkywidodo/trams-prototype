export interface ChecklistEntry {
  date: string;
  stationId: string;
  checks: Record<string, Record<string, boolean | null>>;
  notes: Record<string, string>;
  progress: number;
  savedAt: string;
}

const STORAGE_KEY = "trams_checklist_history";

const getAll = (): ChecklistEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setAll = (entries: ChecklistEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const useChecklistHistory = () => {
  const saveEntry = (entry: Omit<ChecklistEntry, "savedAt">) => {
    const all = getAll();
    const filtered = all.filter(
      (e) => !(e.date === entry.date && e.stationId === entry.stationId)
    );
    setAll([...filtered, { ...entry, savedAt: new Date().toISOString() }]);
  };

  const getEntry = (stationId: string, date: string): ChecklistEntry | undefined => {
    return getAll().find((e) => e.stationId === stationId && e.date === date);
  };

  const getStationHistory = (stationId: string): ChecklistEntry[] => {
    return getAll()
      .filter((e) => e.stationId === stationId)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getTodayEntry = (stationId: string): ChecklistEntry | undefined => {
    const today = new Date().toISOString().split("T")[0];
    return getEntry(stationId, today);
  };

  return { saveEntry, getEntry, getStationHistory, getTodayEntry };
};