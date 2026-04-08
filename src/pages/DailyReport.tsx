import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAutoSave } from "@/hooks/use-auto-save";
import { usePatrolRecords, ALL_ITEMS, SHIFTS } from "@/hooks/use-patrol-records";
import { STATIONS } from "@/data/stations";
import { PATROL_CATEGORIES } from "@/data/patrol";
import ShiftChecklist from "@/components/patrol/ShiftChecklist";
import SignatureCard from "@/components/patrol/SignatureCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MapPin, Clock, Send, Pen, Calendar, AlertTriangle, ChevronDown, User,
  History, Plus, Trash2, Upload, CheckCircle2, FileText, BookOpen, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

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

// ── Main Page ──
const DailyReport = () => {
  const { date: dateParam } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    records, addRecord, getRecordsForDate, getCompletionStatus,
    addLogbookRecord, getLogbookForDate, todayStr,
  } = usePatrolRecords();

  const reportDate = dateParam || todayStr;
  const isToday = reportDate === todayStr;
  const stationFromUrl = searchParams.get("station");

  const [selectedStation, setSelectedStation] = useState<string>(stationFromUrl || STATIONS[0].id);
  const [mainTab, setMainTab] = useState<"patrol" | "logbook">("patrol");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Patrol state ──
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [notes, setNotes] = useState("");
  const [filledBy, setFilledBy] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const patrolDraft = useMemo(() => ({ checks, notes, selectedStation, filledBy }), [checks, notes, selectedStation, filledBy]);
  const { clearDraft: clearPatrolDraft } = useAutoSave("form-patrol", patrolDraft, (saved) => {
    setChecks(saved.checks);
    setNotes(saved.notes);
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

  const totalCells = ALL_ITEMS.length * SHIFTS.length;
  const filledCells = useMemo(() => {
    let count = 0;
    Object.values(checks).forEach((sc) => {
      Object.values(sc).forEach((v) => { if (v) count++; });
    });
    return count;
  }, [checks]);
  const progress = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  const shiftCompletionStatus = SHIFTS.map((s) => {
    const sc = checks[s.id] || {};
    const done = Object.values(sc).filter(Boolean).length;
    return { ...s, done, total: ALL_ITEMS.length, complete: done === ALL_ITEMS.length && ALL_ITEMS.length > 0 };
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
    addRecord({
      stationId: selectedStation,
      date: todayStr,
      shift: activeShift,
      filledBy: filledBy.trim(),
      filledAt: new Date().toISOString(),
      checks, notes,
      totalChecked: filledCells,
      totalItems: totalCells,
    });
    clearPatrolDraft();
    setChecks({});
    setNotes("");
    toast.success("Patrol record tersimpan!", {
      description: `Oleh ${filledBy.trim()} — ${filledCells}/${totalCells} item`,
    });
  };

  // ── Logbook handlers ──
  const updateLogEntry = (shift: string, section: keyof ShiftData, entryId: string, field: "time" | "description", value: string) => {
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
    addLogbookRecord(selectedStation, todayStr);
    clearLogbookDraft();
    toast.success("Logbook berhasil disimpan!", {
      description: `Stasiun ${STATIONS.find((s) => s.id === selectedStation)?.name}`,
    });
  };

  // ── Recent reports ──
  const recentDates = useMemo(() => {
    const dateSet = new Set<string>();
    records.filter((r) => r.stationId === selectedStation).forEach((r) => dateSet.add(r.date));
    return Array.from(dateSet).sort().reverse().slice(0, 7);
  }, [records, selectedStation]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">Daily Report</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          Laporan Harian Stasiun
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
          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground">
              {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-foreground font-mono">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
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
              {patrolStatus.complete ? "Form Patrol lengkap — Logbook siap di-submit" : "Form Patrol belum lengkap"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {patrolStatus.checked}/{patrolStatus.total} item tercentang ({patrolStatus.percentage}%)
            </p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2 max-w-xs">
              <div
                className={cn("h-full rounded-full transition-all", patrolStatus.complete ? "bg-green-500" : "bg-yellow-500")}
                style={{ width: `${patrolStatus.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs: Patrol | Logbook */}
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
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Nama Pengisi</label>
                  <input
                    value={filledBy}
                    onChange={(e) => setFilledBy(e.target.value)}
                    placeholder="Masukkan nama petugas yang melakukan patrol..."
                    className="w-full mt-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Today's patrol records */}
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
                    {todayRecords.map((rec) => (
                      <div key={rec.id} className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{rec.filledBy}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(rec.filledAt), "HH:mm", { locale: idLocale })} — {rec.totalChecked}/{rec.totalItems} item dicentang
                          </p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          rec.totalChecked === rec.totalItems
                            ? "bg-green-500/15 text-green-600"
                            : "bg-yellow-500/15 text-yellow-600"
                        )}>
                          {Math.round((rec.totalChecked / rec.totalItems) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Progress Patrol Ini</span>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {filledCells}<span className="text-muted-foreground font-normal"> / {totalCells}</span>
                  <span className="text-muted-foreground font-normal ml-1">({progress}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
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
                      s.complete && "data-[state=inactive]:text-accent"
                    )}
                  >
                    {s.shortLabel}
                    {s.done > 0 && (
                      <span className={cn(
                        "ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        s.complete ? "bg-accent text-accent-foreground" : "bg-muted-foreground/15 text-muted-foreground"
                      )}>
                        {s.done}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {SHIFTS.map((shift) => (
                <TabsContent key={shift.id} value={shift.id} className="mt-4">
                  <div className="rounded-xl border border-border bg-card shadow-sm p-4">
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

            {/* Submit Patrol */}
            <div className="mt-6 pb-8">
              <button
                onClick={handlePatrolSubmit}
                disabled={filledCells === 0 || !filledBy.trim()}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-sm transition-all duration-300",
                  filledCells > 0 && filledBy.trim()
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
                Simpan Patrol Record
              </button>
              {!filledBy.trim() && filledCells > 0 && (
                <p className="text-center text-xs text-destructive mt-2">Nama pengisi harus diisi sebelum menyimpan</p>
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
                      <p className="text-xs text-muted-foreground mb-3">Harap mengunggah dokumentasi sesuai kondisi yang terjadi</p>
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

      {/* ── Recent Reports ── */}
      <div className="px-6 md:px-8 pb-8">
        <div className="border-t border-border pt-6">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Laporan Sebelumnya
          </h2>
          {recentDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada laporan sebelumnya</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDates.map((dateStr) => {
                const patrol = getCompletionStatus(selectedStation, dateStr, ALL_ITEMS.length, SHIFTS.length);
                const logbook = getLogbookForDate(selectedStation, dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    className="rounded-lg border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(dateStr), "EEEE, dd MMM yyyy", { locale: idLocale })}
                          {isToday && <span className="ml-2 text-[10px] font-bold text-primary">HARI INI</span>}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Patrol: {patrol.checked}/{patrol.total} ({patrol.percentage}%)
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Logbook: {logbook ? "Submitted" : "Belum"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {patrol.complete && logbook ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-600">
                          <CheckCircle2 className="h-3 w-3 inline mr-1" />
                          Complete
                        </span>
                      ) : patrol.checked > 0 ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-600">
                          Draft
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
