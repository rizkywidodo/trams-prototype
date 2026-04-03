import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, MapPin, Clock, Send, Pen, Calendar, AlertTriangle, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { STATIONS } from "@/data/stations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface PatrolCategory {
  id: string;
  name: string;
  items: PatrolItem[];
}

interface PatrolItem {
  id: string;
  indicator: string;
  description: string;
}

const PATROL_CATEGORIES: PatrolCategory[] = [
  {
    id: "keselamatan",
    name: "KESELAMATAN",
    items: [
      { id: "k1", indicator: "Perangkat dan Fasilitas Keselamatan berfungsi dengan baik", description: "Ketersediaan: APAR, Sprinkler, Smoke Detector, Hydrant, Pintu dan Daftar Telepon Darurat" },
      { id: "k2", indicator: "Perlengkapan penunjang kondisi kedaruratan berfungsi dengan baik", description: "Memastikan ketersediaan, jumlah dan kondisi perlengkapan pada Warden Box" },
      { id: "k3", indicator: "Fasilitas kesehatan berfungsi dengan baik", description: "Memastikan ketersediaan dan kondisi ruangan P3K dan perlengkapan penunjang" },
      { id: "k4", indicator: "Fasilitas penunjang evakuasi berfungsi dengan baik", description: "Ketersediaan: Signage Assembly Point dan Arah Evakuasi, PSD, ESD" },
      { id: "k5", indicator: "Perangkat dan Fasilitas keselamatan berfungsi dengan baik", description: "Ketersediaan Fasilitas: Ramp Portabel, Panel LCPS, Marka Antrian, Guiding Block, Area licin & tdk rata" },
    ],
  },
  {
    id: "kemudahan",
    name: "KEMUDAHAN",
    items: [
      { id: "m1", indicator: "Signage informasi jelas", description: "Papan informasi dan petunjuk arah terbaca dengan baik" },
      { id: "m2", indicator: "Customer service tersedia", description: "Petugas CS bertugas dan siap melayani" },
    ],
  },
  {
    id: "kesetaraan",
    name: "KESETARAAN",
    items: [
      { id: "s1", indicator: "Fasilitas disabilitas tersedia", description: "Guiding block, ramp, dan braille sign berfungsi" },
      { id: "s2", indicator: "Ruang laktasi tersedia dan bersih", description: "Ketersediaan dan kebersihan ruang laktasi" },
    ],
  },
  {
    id: "kehandalan",
    name: "KEHANDALAN",
    items: [
      { id: "h1", indicator: "Eskalator dan elevator beroperasi normal", description: "Cek kondisi operasional eskalator dan elevator" },
      { id: "h2", indicator: "Gate dan mesin tiket berfungsi", description: "Pastikan gate dan mesin tiket beroperasi dengan baik" },
      { id: "h3", indicator: "Sistem pendingin berfungsi", description: "AC dan ventilasi stasiun berjalan normal" },
    ],
  },
  {
    id: "kenyamanan",
    name: "KENYAMANAN",
    items: [
      { id: "n1", indicator: "Kebersihan area stasiun terjaga", description: "Lantai, dinding, dan ceiling bersih" },
      { id: "n2", indicator: "Pencahayaan memadai", description: "Semua lampu berfungsi dengan baik" },
      { id: "n3", indicator: "Toilet bersih dan berfungsi", description: "Ketersediaan air, sabun, dan tissue" },
    ],
  },
  {
    id: "keamanan",
    name: "KEAMANAN",
    items: [
      { id: "a1", indicator: "CCTV beroperasi normal", description: "Semua kamera CCTV aktif dan merekam" },
      { id: "a2", indicator: "Petugas keamanan tersedia", description: "Petugas keamanan bertugas sesuai jadwal" },
    ],
  },
];

const SHIFTS = [
  { id: "handover-1", label: "Handover 06:00", shortLabel: "Handover 06:00" },
  { id: "checklist-1", label: "Checklist I", shortLabel: "Checklist I" },
  { id: "handover-2", label: "Handover 14:00", shortLabel: "Handover 14:00" },
  { id: "checklist-2", label: "Checklist II", shortLabel: "Checklist II" },
  { id: "handover-3", label: "Handover 22:00", shortLabel: "Handover 22:00" },
  { id: "checklist-3", label: "Checklist III", shortLabel: "Checklist III" },
  { id: "window-closing", label: "Window Clearing", shortLabel: "Window Clearing" },
  { id: "opening", label: "Opening 04:00", shortLabel: "Opening 04:00" },
];

const ALL_ITEMS = PATROL_CATEGORIES.flatMap((c) => c.items);

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
      {/* Mini progress for this shift */}
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
            {/* Category label with select-all checkbox */}
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
              {/* Items */}
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
                      {/* Checkbox */}
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

                      {/* Content */}
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
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    navigate(`/daily-check/patrol/submitted?station=${selectedStation}`);
  };

  // Count completed shifts (all items checked)
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

      {/* Overall Progress */}
      <div className="px-6 md:px-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Progress Keseluruhan</span>
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

      {/* Notes for unchecked items */}
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
            placeholder="Tuliskan catatan temuan di sini..."
            className="min-h-[100px] text-sm"
          />
        </div>
      </div>

      {/* TTD / Signature Section */}
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
          disabled={filledCells === 0}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-sm transition-all duration-300",
            filledCells > 0
              ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
          Submit Patrol
        </button>
      </div>
    </div>
  );
};

export default FormPatrol;
