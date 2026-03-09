import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ChevronDown, ChevronRight, MapPin, Clock, Send } from "lucide-react";
import { STATIONS } from "@/data/stations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    name: "Keselamatan",
    items: [
      { id: "k1", indicator: "Perangkat dan fasilitas keselamatan berfungsi dengan baik", description: "APAR, Sprinkler, Smoke Detector, Hydrant, P3K dan lainnya" },
      { id: "k2", indicator: "Petunjuk penunjang keselamatan berfungsi dengan baik", description: "Ketersediaan, kesesuaian jumlah dan kondisi pemasangan pada Warden Box" },
      { id: "k3", indicator: "Fasilitas evakuasi berfungsi dengan baik", description: "Ketersediaan dan kondisi P3K dan perlengkapan penumpang" },
      { id: "k4", indicator: "Fasilitas penunjang evakuasi berfungsi dengan baik", description: "Signage Assembly Point, Signage Arah Evakuasi, SOP, LSD" },
      { id: "k5", indicator: "Perangkat dan fasilitas keselamatan berfungsi", description: "Ketersediaan fasilitas Pump Pemadam, Panel GPS, Marks & Written, Boarding Block" },
    ],
  },
  {
    id: "kehandalan",
    name: "Kehandalan",
    items: [
      { id: "h1", indicator: "Eskalator dan elevator beroperasi normal", description: "Cek kondisi operasional eskalator dan elevator" },
      { id: "h2", indicator: "Gate dan mesin tiket berfungsi", description: "Pastikan gate dan mesin tiket beroperasi dengan baik" },
      { id: "h3", indicator: "Sistem pendingin berfungsi", description: "AC dan ventilasi stasiun berjalan normal" },
    ],
  },
  {
    id: "kenyamanan",
    name: "Kenyamanan",
    items: [
      { id: "n1", indicator: "Kebersihan area stasiun terjaga", description: "Lantai, dinding, dan ceiling bersih" },
      { id: "n2", indicator: "Pencahayaan memadai", description: "Semua lampu berfungsi dengan baik" },
      { id: "n3", indicator: "Toilet bersih dan berfungsi", description: "Ketersediaan air, sabun, dan tissue" },
    ],
  },
  {
    id: "keamanan",
    name: "Keamanan",
    items: [
      { id: "a1", indicator: "CCTV beroperasi normal", description: "Semua kamera CCTV aktif dan merekam" },
      { id: "a2", indicator: "Petugas keamanan tersedia", description: "Petugas keamanan bertugas sesuai jadwal" },
    ],
  },
  {
    id: "kesetaraan",
    name: "Kesetaraan",
    items: [
      { id: "s1", indicator: "Fasilitas disabilitas tersedia", description: "Guiding block, ramp, dan braille sign berfungsi" },
      { id: "s2", indicator: "Ruang laktasi tersedia dan bersih", description: "Ketersediaan dan kebersihan ruang laktasi" },
    ],
  },
  {
    id: "kemudahan",
    name: "Kemudahan",
    items: [
      { id: "m1", indicator: "Signage informasi jelas", description: "Papan informasi dan petunjuk arah terbaca dengan baik" },
      { id: "m2", indicator: "Customer service tersedia", description: "Petugas CS bertugas dan siap melayani" },
    ],
  },
];

const SHIFTS = [
  { id: "handover-1", label: "Handover", time: "06:00" },
  { id: "checklist-1", label: "Checklist", time: "" },
  { id: "handover-2", label: "Handover", time: "14:00" },
  { id: "checklist-2", label: "Checklist", time: "" },
  { id: "handover-3", label: "Handover", time: "22:00" },
  { id: "checklist-3", label: "Checklist", time: "" },
  { id: "window-closing", label: "Window Closing", time: "" },
  { id: "opening", label: "Opening", time: "04:00" },
];

type CheckValue = "ok" | "no" | null;
type PatrolChecks = Record<string, CheckValue>;

const FormPatrol = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ keselamatan: true });
  const [checks, setChecks] = useState<Record<string, PatrolChecks>>({});

  const stationName = STATIONS.find((s) => s.id === selectedStation)?.name ?? "";

  const toggleCheck = (itemId: string) => {
    setChecks((prev) => {
      const shiftChecks = prev[activeShift] || {};
      const cur = shiftChecks[itemId] || null;
      const next: CheckValue = cur === null ? "ok" : cur === "ok" ? "no" : null;
      return { ...prev, [activeShift]: { ...shiftChecks, [itemId]: next } };
    });
  };

  const getCheck = (itemId: string): CheckValue => checks[activeShift]?.[itemId] || null;

  const totalItems = PATROL_CATEGORIES.reduce((a, c) => a + c.items.length, 0);
  const filledItems = useMemo(() => {
    const sc = checks[activeShift] || {};
    return Object.values(sc).filter((v) => v !== null).length;
  }, [checks, activeShift]);
  const progress = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;

  const handleSubmit = () => {
    navigate(`/daily-check/patrol/submitted?station=${selectedStation}`);
  };

  const activeShiftData = SHIFTS.find((s) => s.id === activeShift)!;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/50 -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-primary-foreground/60 text-xs font-medium tracking-widest uppercase mb-1">Station Patrol</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground tracking-tight">
                Form Patrol
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-primary-foreground/80 text-sm">{stationName}</span>
              </div>
            </div>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-56 h-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground backdrop-blur-sm text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Shift tabs */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        <div className="px-4 md:px-8">
          <Tabs value={activeShift} onValueChange={setActiveShift}>
            <TabsList className="h-auto bg-transparent p-0 gap-0 w-full justify-start overflow-x-auto">
              {SHIFTS.map((shift) => (
                <TabsTrigger
                  key={shift.id}
                  value={shift.id}
                  className={cn(
                    "relative rounded-none border-b-2 border-transparent px-4 py-3 text-xs font-medium transition-all",
                    "data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="block">{shift.label}</span>
                  {shift.time && (
                    <span className="block text-[10px] font-bold mt-0.5 opacity-70">{shift.time}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Progress + context bar */}
      <div className="px-6 md:px-8 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {activeShiftData.label}{activeShiftData.time ? ` · ${activeShiftData.time}` : ""}
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {filledItems}/{totalItems}
            <span className="text-muted-foreground font-normal ml-1">terisi</span>
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist cards */}
      <div className="px-6 md:px-8 pb-8 space-y-3">
        {PATROL_CATEGORIES.map((cat) => {
          const isOpen = expandedCats[cat.id];
          const catFilled = cat.items.filter((i) => getCheck(i.id) !== null).length;
          const allDone = catFilled === cat.items.length;

          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedCats((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                className="flex items-center justify-between w-full px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-foreground">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                    allDone
                      ? "bg-accent/15 text-accent"
                      : catFilled > 0
                        ? "bg-warning/15 text-warning"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {catFilled}/{cat.items.length}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {cat.items.map((item, idx) => {
                    const val = getCheck(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground font-mono mt-0.5 min-w-[1.5rem]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">{item.indicator}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                        </div>
                        <button
                          onClick={() => toggleCheck(item.id)}
                          className={cn(
                            "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 border-2",
                            val === "ok" && "bg-accent border-accent text-accent-foreground shadow-md shadow-accent/25 scale-105",
                            val === "no" && "bg-destructive border-destructive text-destructive-foreground shadow-md shadow-destructive/25 scale-105",
                            val === null && "border-border bg-card hover:border-accent/40 hover:scale-105"
                          )}
                        >
                          {val === "ok" && <Check className="h-4 w-4" strokeWidth={3} />}
                          {val === "no" && <X className="h-4 w-4" strokeWidth={3} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit */}
        <div className="pt-4 pb-4">
          <button
            onClick={handleSubmit}
            disabled={filledItems === 0}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 rounded-xl py-4 font-bold text-sm transition-all duration-300",
              filledItems > 0
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
            Submit Patrol
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormPatrol;
