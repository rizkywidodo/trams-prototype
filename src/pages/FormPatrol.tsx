import { useState, useMemo, useEffect } from "react";
import { useAutoSave } from "@/hooks/use-auto-save";
import { usePatrolRecords } from "@/hooks/use-patrol-records";
import { useNavigate } from "react-router-dom";
import { Check, MapPin, Clock, Send, Pen, Calendar, AlertTriangle, ChevronDown, User, History } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { STATIONS } from "@/data/stations";
import { PATROL_CATEGORIES, ALL_ITEMS, SHIFTS } from "@/data/patrol";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

// Signature card with button + barcode authentication
const SignatureCard = ({ label }: { label: string }) => {
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string>("");

  const barcodePattern = useMemo(() => {
    const seed = label + signedAt;
    const bars: number[] = [];
    for (let i = 0; i < 36; i++) {
      bars.push((seed.charCodeAt(i % seed.length) * (i + 1)) % 4 + 1);
    }
    return bars;
  }, [label, signedAt]);

  const handleSign = () => {
    const now = new Date().toISOString();
    setSignedAt(now);
    setSigned(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center space-y-2.5">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">Name</p>
      {!signed ? (
        <button
          onClick={handleSign}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Pen className="h-3 w-3" />
          Signed here
        </button>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-[1px] py-1">
            {barcodePattern.map((w, i) => (
              <div
                key={i}
                className="bg-foreground rounded-[0.5px]"
                style={{ width: `${w}px`, height: "32px" }}
              />
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground font-mono break-all">
            {btoa(label + "|" + signedAt).slice(0, 28)}
          </p>
          <button
            onClick={() => setSigned(false)}
            className="text-[10px] text-destructive hover:underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

// Checklist for a single shift
const ShiftChecklist = ({
  shiftId,
  checks,
  toggleCheck,
  toggleCategory,
}: {
  shiftId: string;
  checks: Record<string, boolean>;
  toggleCheck: (itemId: string) => void;
  toggleCategory: (catId: string) => void;
}) => {
  let idx = 0;
  const checkedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="text-[11px] text-muted-foreground">
          {checkedCount} / {ALL_ITEMS.length} item selesai
        </span>
        <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${ALL_ITEMS.length > 0 ? (checkedCount / ALL_ITEMS.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {PATROL_CATEGORIES.map((cat) => {
        const allChecked = cat.items.length > 0 && cat.items.every((item) => checks[item.id]);
        const someChecked = cat.items.some((item) => checks[item.id]);

        return (
          <Collapsible key={cat.id} defaultOpen className="mb-3">
            <div className={cn(
              "px-3 py-2 rounded-lg mb-1 flex items-center justify-between transition-colors duration-300",
              allChecked
                ? "bg-green-500/15 border border-green-500/30"
                : someChecked
                  ? "bg-yellow-500/15 border border-yellow-500/30"
                  : "bg-secondary/50"
            )}>
              <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:rotate-[-90deg] [[data-state=open]_&]:rotate-0" />
                <div className="flex items-center gap-2">
                  {!allChecked && someChecked && (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                  {allChecked && (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                  <span className={cn(
                    "text-[11px] font-bold tracking-wide",
                    allChecked ? "text-green-600 dark:text-green-400" : "text-foreground"
                  )}>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">({cat.items.filter(i => checks[i.id]).length}/{cat.items.length})</span>
                </div>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Semua</span>
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="h-5 w-5 rounded border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
              </div>
            </div>

            <CollapsibleContent>
              <div className="divide-y divide-border/40">
                {cat.items.map((item) => {
                  idx++;
                  const checked = checks[item.id] || false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors rounded-md",
                        checked ? "bg-accent/5" : "hover:bg-muted/40"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-6 w-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200",
                          checked
                            ? "bg-accent border-accent text-accent-foreground shadow-sm"
                            : "border-border/60 bg-background"
                        )}
                      >
                        {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">{idx}.</span>
                          <p className="text-xs font-semibold leading-snug text-foreground">
                            {item.indicator}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 ml-5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

const FormPatrol = () => {
  const navigate = useNavigate();
  const { addRecord, getRecordsForDate, todayStr } = usePatrolRecords();
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [notes, setNotes] = useState("");
  const [filledBy, setFilledBy] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);

  const draftPayload = useMemo(() => ({ checks, notes, selectedStation, filledBy }), [checks, notes, selectedStation, filledBy]);
  const { clearDraft } = useAutoSave("form-patrol", draftPayload, (saved) => {
    setChecks(saved.checks);
    setNotes(saved.notes);
    if (saved.selectedStation) setSelectedStation(saved.selectedStation);
    if (saved.filledBy) setFilledBy(saved.filledBy);
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayRecords = useMemo(
    () => getRecordsForDate(selectedStation, todayStr),
    [getRecordsForDate, selectedStation, todayStr]
  );

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

  const totalCells = ALL_ITEMS.length * SHIFTS.length;
  const filledCells = useMemo(() => {
    let count = 0;
    Object.values(checks).forEach((sc) => {
      Object.values(sc).forEach((v) => { if (v) count++; });
    });
    return count;
  }, [checks]);
  const progress = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  const handleSubmit = () => {
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
      checks,
      notes,
      totalChecked: filledCells,
      totalItems: totalCells,
    });

    clearDraft();
    // Reset form for next patrol
    setChecks({});
    setNotes("");
    toast.success("Patrol record tersimpan!", {
      description: `Oleh ${filledBy.trim()} — ${filledCells}/${totalCells} item`,
    });
  };

  const shiftCompletionStatus = SHIFTS.map((s) => {
    const sc = checks[s.id] || {};
    const done = Object.values(sc).filter(Boolean).length;
    return { ...s, done, total: ALL_ITEMS.length, complete: done === ALL_ITEMS.length && ALL_ITEMS.length > 0 };
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">Station Patrol</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          Form Station Patrol
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

      {/* Nama Pengisi */}
      <div className="px-6 md:px-8 pb-4">
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
        <div className="px-6 md:px-8 pb-4">
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

      {/* Overall Progress */}
      <div className="px-6 md:px-8 pb-4">
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
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Shift Tabs */}
      <div className="px-6 md:px-8 pb-6">
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
                    s.complete
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted-foreground/15 text-muted-foreground"
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
      </div>

      {/* Notes */}
      <div className="px-6 md:px-8 pb-6">
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
      <div className="px-6 md:px-8 pb-6">
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

      {/* Submit */}
      <div className="px-6 md:px-8 pb-8">
        <button
          onClick={handleSubmit}
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
    </div>
  );
};

export default FormPatrol;
