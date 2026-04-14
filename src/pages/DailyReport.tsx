import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAutoSave } from "@/hooks/use-auto-save";
import { usePatrolRecords, ALL_ITEMS, SHIFTS } from "@/hooks/use-patrol-records";
import { PATROL_CATEGORIES } from "@/data/patrol";
import { STATIONS } from "@/data/stations";
import ShiftChecklist from "@/components/patrol/ShiftChecklist";
import SignatureCard from "@/components/patrol/SignatureCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin, Clock, Send, Pen, AlertTriangle, ChevronDown, User,
  History, Plus, Trash2, Upload, CheckCircle2, FileText, BookOpen,
  ArrowLeft, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { PatrolRecord } from "@/hooks/use-patrol-records";

// ── Logbook types ──
interface LogEntry {
  id: string;
  time: string;
  description: string;
}
interface ShiftData {
  gangguanFasilitas: LogEntry[];
  eventKunjungan: LogEntry[];
  pekerjaanArea: LogEntry[];
  keluhan: LogEntry[];
}
const createEmptyShift = (): ShiftData => ({
  gangguanFasilitas: [
    { id: crypto.randomUUID(), time: "", description: "" },
    { id: crypto.randomUUID(), time: "", description: "" },
  ],
  eventKunjungan: [
    { id: crypto.randomUUID(), time: "", description: "" },
    { id: crypto.randomUUID(), time: "", description: "" },
    { id: crypto.randomUUID(), time: "", description: "" },
  ],
  pekerjaanArea: [
    { id: crypto.randomUUID(), time: "", description: "" },
    { id: crypto.randomUUID(), time: "", description: "" },
  ],
  keluhan: [
    { id: crypto.randomUUID(), time: "", description: "" },
    { id: crypto.randomUUID(), time: "", description: "" },
  ],
});
const LOGBOOK_SECTIONS: { key: keyof ShiftData; label: string }[] = [
  { key: "gangguanFasilitas", label: "Gangguan Fasilitas/Kejadian/Pelanggaran/Insiden" },
  { key: "eventKunjungan", label: "Event/Kunjungan/Koordinasi Stakeholder" },
  { key: "pekerjaanArea", label: "Pekerjaan di Area Stasiun" },
  { key: "keluhan", label: "Keluhan/Apresiasi" },
];
const LOGBOOK_SHIFT_TABS = ["Shift 1", "Shift 2", "Shift 3", "Cash Handling"];

// ── Record Detail Modal ──
const RecordDetailModal = ({
  record,
  open,
  onClose,
}: {
  record: PatrolRecord | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!record) return null;

  const shiftLabel = SHIFTS.find((s) => s.id === record.shift)?.label ?? record.shift;
  const checkedItems = Object.entries(record.checks)
    .filter(([, val]) => val)
    .map(([id]) => id);
  const uncheckedItems = ALL_ITEMS.filter((item) => !record.checks[item.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Detail Record Patrol</DialogTitle>
        </DialogHeader>

        {/* Meta */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift</span>
            <span className="font-semibold">{shiftLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diisi oleh</span>
            <span className="font-semibold">{record.filledBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Waktu submit</span>
            <span className="font-semibold">
              {format(new Date(record.filledAt), "HH:mm, dd MMM yyyy", { locale: idLocale })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progress</span>
            <span className={cn(
              "font-bold",
              record.totalChecked === record.totalItems ? "text-green-600" : "text-yellow-600"
            )}>
              {record.totalChecked}/{record.totalItems} item ({Math.round((record.totalChecked / record.totalItems) * 100)}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              record.totalChecked === record.totalItems ? "bg-green-500" : "bg-yellow-500"
            )}
            style={{ width: `${Math.round((record.totalChecked / record.totalItems) * 100)}%` }}
          />
        </div>

        {/* Unchecked items */}
        {uncheckedItems.length > 0 && (
          <div>
            <p className="text-xs font-bold text-destructive mb-2 flex items-center gap-1.5">
              <X className="h-3.5 w-3.5" />
              Belum dicentang ({uncheckedItems.length})
            </p>
            <div className="space-y-1">
              {uncheckedItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
                  <X className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{item.indicator}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div>
            <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              Catatan Temuan
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed">
              {record.notes}
            </p>
          </div>
        )}

        {/* All checked */}
        {uncheckedItems.length === 0 && (
          <div className="flex items-center gap-2 text-green-600 bg-green-500/10 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold">Semua item sudah tercentang</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ──
const DailyReport = () => {
  const { date: dateParam } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    records, addRecord, getRecordsForDate, getRecordsForShift,
    getCompletionStatus, addLogbookRecord, getLogbookForDate, todayStr,
  } = usePatrolRecords();

  const reportDate = dateParam || todayStr;
  const isToday = reportDate === todayStr;
  const stationFromUrl = searchParams.get("station");

  const [selectedStation, setSelectedStation] = useState<string>(stationFromUrl || STATIONS[0].id);
  const [mainTab, setMainTab] = useState<"patrol" | "logbook">("patrol");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal state
  const [selectedRecord, setSelectedRecord] = useState<PatrolRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Patrol state ──
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  // checks is now PER SHIFT: shiftId -> itemId -> boolean
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [notes, setNotes] = useState("");
  const [filledBy, setFilledBy] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const patrolDraft = useMemo(
    () => ({ checks, notes, selectedStation, filledBy }),
    [checks, notes, selectedStation, filledBy]
  );
  const { clearDraft: clearPatrolDraft } = useAutoSave("form-patrol", patrolDraft, (saved) => {
    setChecks(saved.checks || {});
    setNotes(saved.notes || "");
    if (saved.selectedStation) setSelectedStation(saved.selectedStation);
    if (saved.filledBy) setFilledBy(saved.filledBy);
  });

  // ── Logbook state ──
  const [activeLogbookShift, setActiveLogbookShift] = useState("Shift 1");
  const [logbookData, setLogbookData] = useState<Record<string, ShiftData>>(() => {
    const init: Record<string, ShiftData> = {};
    LOGBOOK_SHIFT_TABS.forEach((s) => { init[s] = createEmptyShift(); });
    return init;
  });
  const logbookDraft = useMemo(() => ({ logbookData, selectedStation }), [logbookData, selectedStation]);
  const { clearDraft: clearLogbookDraft } = useAutoSave("logbook", logbookDraft, (saved) => {
    if (saved.logbookData) setLogbookData(saved.logbookData);
  });

  // ── Derived ──
  const todayRecords = useMemo(
    () => getRecordsForDate(selectedStation, reportDate),
    [getRecordsForDate, selectedStation, reportDate]
  );

  const patrolStatus = useMemo(
    () => getCompletionStatus(selectedStation, reportDate, ALL_ITEMS.length, SHIFTS.length),
    [getCompletionStatus, selectedStation, reportDate]
  );

  // Current shift's checks from state
  const activeShiftChecks = checks[activeShift] || {};

  // Progress for the ACTIVE shift only
  const activeShiftCheckedCount = Object.values(activeShiftChecks).filter(Boolean).length;
  const activeShiftProgress = ALL_ITEMS.length > 0
    ? Math.round((activeShiftCheckedCount / ALL_ITEMS.length) * 100)
    : 0;

  // Per-shift completion status for tab indicators
  const shiftCompletionStatus = SHIFTS.map((s) => {
    // Check latest submitted record for this shift
    const shiftRecords = getRecordsForShift(selectedStation, reportDate, s.id);
    const latestRecord = shiftRecords.length
      ? shiftRecords.reduce((latest, r) =>
          new Date(r.filledAt) > new Date(latest.filledAt) ? r : latest
        )
      : null;

    // Also check current unsaved state
    const currentChecks = checks[s.id] || {};
    const currentDone = Object.values(currentChecks).filter(Boolean).length;

    const submittedDone = latestRecord?.totalChecked ?? 0;
    const done = Math.max(currentDone, submittedDone);
    const total = ALL_ITEMS.length;
    const hasSubmitted = !!latestRecord;

    return {
      ...s,
      done,
      total,
      complete: hasSubmitted && submittedDone === total,
      hasSubmitted,
      latestRecord,
    };
  });

  // ── Patrol handlers ──
  const toggleCheck = (shiftId: string, itemId: string) => {
    setChecks((prev) => {
      const sc = prev[shiftId] || {};
      return { ...prev, [shiftId]: { ...sc, [itemId]: !sc[itemId] } };
    });
  };

  const toggleCategory = (shiftId: string, catId: string) => {
    setChecks((prev) => {
      const sc = { ...(prev[shiftId] || {}) };
      const cat = PATROL_CATEGORIES.find((c) => c.id === catId);
      if (!cat) return prev;
      const allChecked = cat.items.every((item) => sc[item.id]);
      cat.items.forEach((item) => { sc[item.id] = !allChecked; });
      return { ...prev, [shiftId]: sc };
    });
  };

  const handlePatrolSubmit = () => {
    if (!filledBy.trim()) {
      toast.error("Nama pengisi harus diisi!");
      return;
    }

    // Only save the ACTIVE shift's checks
    const shiftChecks = checks[activeShift] || {};
    const checkedCount = Object.values(shiftChecks).filter(Boolean).length;

    if (checkedCount === 0) {
      toast.error("Belum ada item yang dicentang!");
      return;
    }

    const shiftLabel = SHIFTS.find((s) => s.id === activeShift)?.label ?? activeShift;

    addRecord({
      stationId: selectedStation,
      date: reportDate,
      shift: activeShift,
      filledBy: filledBy.trim(),
      filledAt: new Date().toISOString(),
      checks: shiftChecks,           // only this shift's checks
      notes,
      totalChecked: checkedCount,
      totalItems: ALL_ITEMS.length,  // items per shift
    });

    // Clear only this shift's checks from state
    setChecks((prev) => ({ ...prev, [activeShift]: {} }));
    setNotes("");
    clearPatrolDraft();

    toast.success(`${shiftLabel} tersimpan!`, {
      description: `Oleh ${filledBy.trim()} — ${checkedCount}/${ALL_ITEMS.length} item`,
    });
  };

  // ── Logbook handlers ──
  const updateLogEntry = (
    shift: string, section: keyof ShiftData,
    entryId: string, field: "time" | "description", value: string
  ) => {
    setLogbookData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: prev[shift][section].map((e) =>
          e.id === entryId ? { ...e, [field]: value } : e
        ),
      },
    }));
  };

  const addLogRow = (shift: string, section: keyof ShiftData) => {
    setLogbookData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: [...prev[shift][section], { id: crypto.randomUUID(), time: "", description: "" }],
      },
    }));
  };

  const removeLogRow = (shift: string, section: keyof ShiftData, entryId: string) => {
    setLogbookData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: prev[shift][section].filter((e) => e.id !== entryId),
      },
    }));
  };

  const canSubmitLogbook = patrolStatus.complete;

  const handleLogbookSubmit = () => {
    if (!canSubmitLogbook) {
      toast.error("Form Patrol belum lengkap!", {
        description: `${patrolStatus.checked}/${patrolStatus.total} item tercentang (${patrolStatus.percentage}%)`,
      });
      return;
    }
    addLogbookRecord(selectedStation, reportDate);
    clearLogbookDraft();
    toast.success("Logbook berhasil disimpan!", {
      description: `Stasiun ${STATIONS.find((s) => s.id === selectedStation)?.name}`,
    });
  };

  const openRecordDetail = (record: PatrolRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4">
        <button
          onClick={() => navigate("/daily-check/report")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Daftar Laporan
        </button>
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">Daily Report</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          {format(parseISO(reportDate), "EEEE, dd MMMM yyyy", { locale: idLocale })}
          {isToday && (
            <span className="ml-2 text-sm font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
              HARI INI
            </span>
          )}
        </h1>
        <div className="flex items-center flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-56 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isToday && (
            <div className="flex items-center gap-2 ml-auto">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-foreground font-mono">
                {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Patrol completion banner */}
      <div className="px-6 md:px-8 pb-4">
        <div className={cn(
          "rounded-lg border p-4 flex items-start gap-3",
          patrolStatus.complete
            ? "border-green-500/30 bg-green-500/5"
            : "border-yellow-500/30 bg-yellow-500/5"
        )}>
          {patrolStatus.complete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={cn("text-sm font-semibold", patrolStatus.complete ? "text-green-700" : "text-yellow-700")}>
              {patrolStatus.complete
                ? "Form Patrol lengkap — Logbook siap di-submit"
                : "Form Patrol belum lengkap"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {patrolStatus.checked}/{patrolStatus.total} item tercentang ({patrolStatus.percentage}%)
            </p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2 max-w-xs">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  patrolStatus.complete ? "bg-green-500" : "bg-yellow-500"
                )}
                style={{ width: `${patrolStatus.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="px-6 md:px-8 pb-6">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "patrol" | "logbook")}>
          <TabsList className="mb-6 h-11">
            <TabsTrigger value="patrol" className="text-sm font-semibold gap-2 px-6">
              <FileText className="h-4 w-4" />
              Form Patrol
            </TabsTrigger>
            <TabsTrigger value="logbook" className="text-sm font-semibold gap-2 px-6">
              <BookOpen className="h-4 w-4" />
              Logbook
            </TabsTrigger>
          </TabsList>

          {/* ══════ PATROL TAB ══════ */}
          <TabsContent value="patrol">
            {/* Nama Pengisi */}
            <div className="pb-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <User className="h-5 w-5 text-accent shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Nama Pengisi
                  </label>
                  <input
                    value={filledBy}
                    onChange={(e) => setFilledBy(e.target.value)}
                    placeholder="Masukkan nama petugas yang melakukan patrol..."
                    className="w-full mt-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* History */}
            {todayRecords.length > 0 && (
              <div className="pb-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent/80 transition-colors mb-2"
                >
                  <History className="h-3.5 w-3.5" />
                  Patrol hari ini: {todayRecords.length} record
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showHistory && "rotate-180")} />
                </button>
                {showHistory && (
                  <div className="space-y-2">
                    {todayRecords
                      .slice()
                      .sort((a, b) => new Date(b.filledAt).getTime() - new Date(a.filledAt).getTime())
                      .map((rec) => {
                        const shiftLabel = SHIFTS.find((s) => s.id === rec.shift)?.label ?? rec.shift;
                        const pct = Math.round((rec.totalChecked / rec.totalItems) * 100);
                        const complete = rec.totalChecked === rec.totalItems;
                        return (
                          <button
                            key={rec.id}
                            onClick={() => openRecordDetail(rec)}
                            className="w-full rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between hover:bg-muted/60 transition-colors text-left group"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">{shiftLabel}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {rec.filledBy} · {format(new Date(rec.filledAt), "HH:mm", { locale: idLocale })}
                                {" — "}
                                {rec.totalChecked}/{rec.totalItems} item
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full",
                                complete
                                  ? "bg-green-500/15 text-green-600"
                                  : "bg-yellow-500/15 text-yellow-600"
                              )}>
                                {pct}%
                              </span>
                              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                Lihat →
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Active shift progress */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Progress — {SHIFTS.find((s) => s.id === activeShift)?.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {activeShiftCheckedCount}
                  <span className="text-muted-foreground font-normal"> / {ALL_ITEMS.length}</span>
                  <span className="text-muted-foreground font-normal ml-1">({activeShiftProgress}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activeShiftProgress}%` }}
                />
              </div>
            </div>

            {/* Shift Tabs */}
            <Tabs value={activeShift} onValueChange={setActiveShift}>
              <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1.5 rounded-xl">
                {shiftCompletionStatus.map((s) => (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className={cn(
                      "relative text-[11px] font-semibold px-3 py-2 rounded-lg data-[state=active]:shadow-md transition-all",
                      s.complete && "data-[state=inactive]:text-green-600"
                    )}
                  >
                    {s.shortLabel}
                    {s.hasSubmitted ? (
                      <span className={cn(
                        "ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        s.complete
                          ? "bg-green-500/20 text-green-600"
                          : "bg-yellow-500/15 text-yellow-600"
                      )}>
                        {s.done}/{s.total}
                      </span>
                    ) : s.done > 0 ? (
                      <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">
                        {s.done}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>

              {SHIFTS.map((shift) => (
                <TabsContent key={shift.id} value={shift.id} className="mt-4">
                  <div className="rounded-xl border border-border bg-card shadow-sm p-4">
                    {/* Show latest submitted badge for this shift */}
                    {(() => {
                      const info = shiftCompletionStatus.find((s) => s.id === shift.id);
                      return info?.hasSubmitted ? (
                        <div className={cn(
                          "mb-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2",
                          info.complete
                            ? "bg-green-500/10 text-green-700"
                            : "bg-yellow-500/10 text-yellow-700"
                        )}>
                          {info.complete
                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                          <span className="font-semibold">
                            {info.complete
                              ? `Shift ini sudah lengkap (${info.latestRecord?.filledBy})`
                              : `Record terakhir: ${info.done}/${info.total} item oleh ${info.latestRecord?.filledBy}`}
                          </span>
                          <button
                            onClick={() => info.latestRecord && openRecordDetail(info.latestRecord)}
                            className="ml-auto text-[10px] underline underline-offset-2 opacity-70 hover:opacity-100"
                          >
                            Lihat detail
                          </button>
                        </div>
                      ) : null;
                    })()}

                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-foreground">{shift.label}</h2>
                    </div>
                    <ShiftChecklist
                      shiftId={shift.id}
                      checks={checks[shift.id] || {}}
                      toggleCheck={(itemId) => toggleCheck(shift.id, itemId)}
                      toggleCategory={(catId) => toggleCategory(shift.id, catId)}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Notes */}
            <div className="mt-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Catatan Temuan
                </h3>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Tuliskan catatan untuk indikator yang tidak terceklis atau temuan lainnya.
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan catatan temuan di sini..."
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>

            {/* Signature */}
            <div className="mt-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Pen className="h-4 w-4 text-accent" />
                  Tanda Tangan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SignatureCard label="Station Head" />
                  <SignatureCard label="Area Authority 1" />
                  <SignatureCard label="Area Authority 2" />
                  <SignatureCard label="Area Authority 3" />
                </div>
              </div>
            </div>

            {/* Submit — per active shift */}
            <div className="mt-6 pb-8">
              <button
                onClick={handlePatrolSubmit}
                disabled={activeShiftCheckedCount === 0 || !filledBy.trim()}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-sm transition-all duration-300",
                  activeShiftCheckedCount > 0 && filledBy.trim()
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
                Simpan {SHIFTS.find((s) => s.id === activeShift)?.label ?? "Shift Ini"}
              </button>
              {!filledBy.trim() && activeShiftCheckedCount > 0 && (
                <p className="text-center text-xs text-destructive mt-2">
                  Nama pengisi harus diisi sebelum menyimpan
                </p>
              )}
            </div>
          </TabsContent>

          {/* ══════ LOGBOOK TAB ══════ */}
          <TabsContent value="logbook">
            <Tabs value={activeLogbookShift} onValueChange={setActiveLogbookShift}>
              <TabsList className="mb-4">
                {LOGBOOK_SHIFT_TABS.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="text-sm">{tab}</TabsTrigger>
                ))}
              </TabsList>

              {LOGBOOK_SHIFT_TABS.map((shift) => (
                <TabsContent key={shift} value={shift}>
                  <div className="space-y-5 max-w-4xl">
                    {LOGBOOK_SECTIONS.map((section) => (
                      <div key={section.key} className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="px-4 py-3 bg-muted/50 border-b border-border">
                          <h3 className="text-sm font-bold text-card-foreground">{section.label}</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {logbookData[shift]?.[section.key]?.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={entry.time}
                                onChange={(e) => updateLogEntry(shift, section.key, entry.id, "time", e.target.value)}
                                placeholder="Jam"
                                className="w-20 rounded-md border border-input bg-background px-2.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                type="text"
                                value={entry.description}
                                onChange={(e) => updateLogEntry(shift, section.key, entry.id, "description", e.target.value)}
                                placeholder="Deskripsi kejadian..."
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                              <button
                                onClick={() => removeLogRow(shift, section.key, entry.id)}
                                className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addLogRow(shift, section.key)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors mt-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Row
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Upload */}
                    <div>
                      <h3 className="text-sm font-bold text-card-foreground mb-1">Unggah Dokumentasi</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Harap mengunggah dokumentasi sesuai kondisi yang terjadi
                      </p>
                      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center py-12 gap-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Choose a file or drag & drop it here</p>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
                        <button className="mt-2 px-6 py-2 rounded-lg border border-border bg-card text-sm font-medium text-card-foreground hover:bg-muted transition-colors">
                          Browse File
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 pb-8">
                      <button
                        onClick={handleLogbookSubmit}
                        disabled={!canSubmitLogbook}
                        className={cn(
                          "px-8 py-2.5 rounded-lg text-sm font-semibold transition-all",
                          canSubmitLogbook
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        Submit Logbook
                      </button>
                      {!canSubmitLogbook && (
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Form Patrol harus lengkap
                        </span>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Detail Modal */}
      <RecordDetailModal
        record={selectedRecord}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default DailyReport;