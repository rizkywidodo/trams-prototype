import { useCallback, useMemo, useSyncExternalStore } from "react";
import { format } from "date-fns";

// Re-export for consumers
export { PATROL_CATEGORIES, ALL_ITEMS, SHIFTS } from "@/data/patrol";

export interface PatrolRecord {
  id: string;
  stationId: string;
  date: string; // YYYY-MM-DD
  shift: string; // shift tab id
  filledBy: string;
  filledAt: string; // ISO
  checks: Record<string, Record<string, boolean>>; // shiftId -> itemId -> checked
  notes: string;
  totalChecked: number;
  totalItems: number;
}

export interface LogbookRecord {
  stationId: string;
  date: string;
  submittedAt: string;
}

const PATROL_STORE_KEY = "patrol-records";
const LOGBOOK_STORE_KEY = "logbook-records";

// Simple external store for cross-component reactivity
let listeners: (() => void)[] = [];
function emitChange() {
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getRecords(): PatrolRecord[] {
  try {
    const raw = localStorage.getItem(PATROL_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLogbookRecords(): LogbookRecord[] {
  try {
    const raw = localStorage.getItem(LOGBOOK_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let snapshotCache: PatrolRecord[] | null = null;
function getSnapshot(): PatrolRecord[] {
  if (!snapshotCache) snapshotCache = getRecords();
  return snapshotCache;
}

export function usePatrolRecords() {
  const records = useSyncExternalStore(subscribe, getSnapshot);

  const addRecord = useCallback(
    (record: Omit<PatrolRecord, "id">) => {
      const all = getRecords();
      const newRecord: PatrolRecord = { ...record, id: crypto.randomUUID() };
      const updated = [...all, newRecord];
      localStorage.setItem(PATROL_STORE_KEY, JSON.stringify(updated));
      snapshotCache = updated;
      emitChange();
      return newRecord;
    },
    []
  );

  const getRecordsForDate = useCallback(
    (stationId: string, date: string) => {
      return records.filter((r) => r.stationId === stationId && r.date === date);
    },
    [records]
  );

  const getCompletionStatus = useCallback(
    (stationId: string, date: string, totalItemsPerShift: number, totalShifts: number) => {
      const dayRecords = records.filter((r) => r.stationId === stationId && r.date === date);
      if (dayRecords.length === 0) return { checked: 0, total: totalItemsPerShift * totalShifts, complete: false, percentage: 0 };

      // Merge all checks from all records — union of checked items
      const mergedChecks: Record<string, Set<string>> = {};
      dayRecords.forEach((rec) => {
        Object.entries(rec.checks).forEach(([shiftId, items]) => {
          if (!mergedChecks[shiftId]) mergedChecks[shiftId] = new Set();
          Object.entries(items).forEach(([itemId, val]) => {
            if (val) mergedChecks[shiftId].add(itemId);
          });
        });
      });

      let checked = 0;
      Object.values(mergedChecks).forEach((s) => (checked += s.size));
      const total = totalItemsPerShift * totalShifts;
      return { checked, total, complete: checked >= total, percentage: total > 0 ? Math.round((checked / total) * 100) : 0 };
    },
    [records]
  );

  const addLogbookRecord = useCallback((stationId: string, date: string) => {
    const all = getLogbookRecords();
    const rec: LogbookRecord = { stationId, date, submittedAt: new Date().toISOString() };
    localStorage.setItem(LOGBOOK_STORE_KEY, JSON.stringify([...all, rec]));
  }, []);

  const getLogbookForDate = useCallback((stationId: string, date: string) => {
    return getLogbookRecords().find((r) => r.stationId === stationId && r.date === date);
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return { records, addRecord, getRecordsForDate, getCompletionStatus, addLogbookRecord, getLogbookForDate, todayStr };
}
