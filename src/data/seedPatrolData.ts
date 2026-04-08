import { ALL_ITEMS, SHIFTS } from "@/data/patrol";

const PATROL_STORE_KEY = "patrol-records";
const LOGBOOK_STORE_KEY = "logbook-records";

function buildFullChecks(): Record<string, Record<string, boolean>> {
  const checks: Record<string, Record<string, boolean>> = {};
  SHIFTS.forEach((s) => {
    checks[s.id] = {};
    ALL_ITEMS.forEach((item) => {
      checks[s.id][item.id] = true;
    });
  });
  return checks;
}

function buildPartialChecks(percentage: number): Record<string, Record<string, boolean>> {
  const checks: Record<string, Record<string, boolean>> = {};
  SHIFTS.forEach((s) => {
    checks[s.id] = {};
    ALL_ITEMS.forEach((item, idx) => {
      checks[s.id][item.id] = idx / ALL_ITEMS.length < percentage;
    });
  });
  return checks;
}

export function seedSampleData() {
  // Don't seed if data already exists
  const existing = localStorage.getItem(PATROL_STORE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.length > 0) return;
    } catch { /* continue */ }
  }

  const totalItems = ALL_ITEMS.length * SHIFTS.length;

  // April 6 - complete report
  const checks6 = buildFullChecks();
  const checked6 = Object.values(checks6).reduce(
    (sum, sc) => sum + Object.values(sc).filter(Boolean).length, 0
  );

  // April 7 - partial report (~80%)
  const checks7 = buildPartialChecks(0.8);
  const checked7 = Object.values(checks7).reduce(
    (sum, sc) => sum + Object.values(sc).filter(Boolean).length, 0
  );

  const records = [
    {
      id: crypto.randomUUID(),
      stationId: "lebak-bulus",
      date: "2026-04-06",
      shift: "handover-1",
      filledBy: "Andi Pratama",
      filledAt: "2026-04-06T07:15:00.000Z",
      checks: checks6,
      notes: "Semua fasilitas berfungsi normal. APAR di lantai 2 sudah dicek dan dalam kondisi baik.",
      totalChecked: checked6,
      totalItems: totalItems,
    },
    {
      id: crypto.randomUUID(),
      stationId: "lebak-bulus",
      date: "2026-04-07",
      shift: "handover-1",
      filledBy: "Budi Santoso",
      filledAt: "2026-04-07T06:45:00.000Z",
      checks: checks7,
      notes: "Eskalator B2 sedang maintenance. Lampu area parkir perlu penggantian.",
      totalChecked: checked7,
      totalItems: totalItems,
    },
  ];

  localStorage.setItem(PATROL_STORE_KEY, JSON.stringify(records));

  // Logbook for April 6 (complete day)
  const logbookRecords = [
    {
      stationId: "lebak-bulus",
      date: "2026-04-06",
      submittedAt: "2026-04-06T16:00:00.000Z",
    },
  ];

  localStorage.setItem(LOGBOOK_STORE_KEY, JSON.stringify(logbookRecords));
}
