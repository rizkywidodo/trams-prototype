import { useCallback, useSyncExternalStore } from "react";
import { format } from "date-fns";

export { PATROL_CATEGORIES, ALL_ITEMS, SHIFTS } from "@/data/patrol";

export interface PatrolRecord {
  id: string;
  stationId: string;
  date: string;        // YYYY-MM-DD
  shift: string;       // shift id (e.g. "handover-1")
  filledBy: string;
  filledAt: string;    // ISO
  checks: Record<string, boolean>; // itemId -> checked (single shift only)
  notes: string;
  totalChecked: number;
  totalItems: number;  // items in THIS shift only
}

export interface LogbookRecord {
  stationId: string;
  date: string;
  submittedAt: string;
}

const PATROL_STORE_KEY = "patrol-records";
const LOGBOOK_STORE_KEY = "logbook-records";

let listeners: (() => void)[] = [];
function emitChange() { listeners.forEach((l) => l()); }
function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export function getRecords(): PatrolRecord[] {
  try {
    const raw = localStorage.getItem(PATROL_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getLogbookRecords(): LogbookRecord[] {
  try {
    const raw = localStorage.getItem(LOGBOOK_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

let snapshotCache: PatrolRecord[] | null = null;
function getSnapshot(): PatrolRecord[] {
  if (!snapshotCache) snapshotCache = getRecords();
  return snapshotCache;
}

export function usePatrolRecords() {
  const records = useSyncExternalStore(subscribe, getSnapshot);

  const addRecord = useCallback((record: Omit<PatrolRecord, "id">) => {
    const all = getRecords();
    const newRecord: PatrolRecord = { ...record, id: crypto.randomUUID() };
    const updated = [...all, newRecord];
    localStorage.setItem(PATROL_STORE_KEY, JSON.stringify(updated));
    snapshotCache = updated;
    emitChange();
    return newRecord;
  }, []);

  // All records for a station+date
  const getRecordsForDate = useCallback(
    (stationId: string, date: string) =>
      records.filter((r) => r.stationId === stationId && r.date === date),
    [records]
  );

  // Records for a specific shift on a date
  const getRecordsForShift = useCallback(
    (stationId: string, date: string, shiftId: string) =>
      records.filter(
        (r) => r.stationId === stationId && r.date === date && r.shift === shiftId
      ),
    [records]
  );

  // Latest record for a specific shift (most recent submission)
  const getLatestForShift = useCallback(
    (stationId: string, date: string, shiftId: string): PatrolRecord | undefined => {
      const shiftRecords = records.filter(
        (r) => r.stationId === stationId && r.date === date && r.shift === shiftId
      );
      if (!shiftRecords.length) return undefined;
      return shiftRecords.reduce((latest, r) =>
        new Date(r.filledAt) > new Date(latest.filledAt) ? r : latest
      );
    },
    [records]
  );

  // Overall completion: all shifts fully checked across all records for that day
  const getCompletionStatus = useCallback(
    (stationId: string, date: string, totalItemsPerShift: number, totalShifts: number) => {
      const dayRecords = records.filter(
        (r) => r.stationId === stationId && r.date === date
      );

      if (!dayRecords.length) {
        return { checked: 0, total: totalItemsPerShift * totalShifts, complete: false, percentage: 0 };
      }

      // For each shift, take the latest record and count its checked items
      const shiftMap = new Map<string, PatrolRecord>();
      dayRecords.forEach((r) => {
        const existing = shiftMap.get(r.shift);
        if (!existing || new Date(r.filledAt) > new Date(existing.filledAt)) {
          shiftMap.set(r.shift, r);
        }
      });

      let checked = 0;
      shiftMap.forEach((r) => { checked += r.totalChecked; });

      const total = totalItemsPerShift * totalShifts;
      return {
        checked,
        total,
        complete: checked >= total,
        percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
      };
    },
    [records]
  );

  const addLogbookRecord = useCallback((stationId: string, date: string) => {
    const all = getLogbookRecords();
    const rec: LogbookRecord = { stationId, date, submittedAt: new Date().toISOString() };
    localStorage.setItem(LOGBOOK_STORE_KEY, JSON.stringify([...all, rec]));
  }, []);

  const getLogbookForDate = useCallback((stationId: string, date: string) =>
    getLogbookRecords().find((r) => r.stationId === stationId && r.date === date),
    []
  );

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return {
    records,
    addRecord,
    getRecordsForDate,
    getRecordsForShift,
    getLatestForShift,
    getCompletionStatus,
    addLogbookRecord,
    getLogbookForDate,
    todayStr,
  };
}