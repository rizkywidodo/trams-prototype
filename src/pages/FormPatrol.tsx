import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ChevronDown, ChevronRight, MapPin, Clock, Send, Pen } from "lucide-react";
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
  { id: "handover-1", label: "Handover Checklist", time: "06:00" },
  { id: "checklist-1", label: "Checklist", time: "" },
  { id: "handover-2", label: "Handover Checklist", time: "14:00" },
  { id: "checklist-2", label: "Checklist", time: "" },
  { id: "handover-3", label: "Handover Checklist", time: "22:00" },
  { id: "checklist-3", label: "Checklist", time: "" },
  { id: "window-closing", label: "Window Time Clearing Checklist", time: "" },
  { id: "opening", label: "Opening Checklist", time: "04:00" },
];

type CheckValue = "ok" | "no" | null;
type PatrolChecks = Record<string, CheckValue>;

// Simple canvas-based signature pad
const SignaturePad = ({ onClear, canvasRef }: { onClear: () => void; canvasRef: React.RefObject<HTMLCanvasElement> }) => {
  const isDrawing = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => { isDrawing.current = false; };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-border rounded-lg bg-muted/30 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-muted-foreground/40 pointer-events-none">
          <Pen className="h-3 w-3" />
          <span className="text-[10px]">Tanda tangan di sini</span>
        </div>
      </div>
      <button onClick={onClear} className="text-xs text-destructive hover:underline">
        Hapus tanda tangan
      </button>
    </div>
  );
};

const FormPatrol = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [activeShift, setActiveShift] = useState(SHIFTS[0].id);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ keselamatan: true });
  const [checks, setChecks] = useState<Record<string, PatrolChecks>>({});

  const sigPetugas = useRef<HTMLCanvasElement>(null);
  const sigKepala = useRef<HTMLCanvasElement>(null);

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

  const clearCanvas = (ref: React.RefObject<HTMLCanvasElement>) => {
    const ctx = ref.current?.getContext("2d");
    if (ctx && ref.current) {
      ctx.clearRect(0, 0, ref.current.width, ref.current.height);
    }
  };

  const handleSubmit = () => {
    navigate(`/daily-check/patrol/submitted?station=${selectedStation}`);
  };

  const activeShiftData = SHIFTS.find((s) => s.id === activeShift)!;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase mb-1">Station Patrol</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          Form Station Patrol
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground text-sm font-medium">{stationName}</span>
          </div>
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-52 h-9 text-sm">
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

      {/* Table-style checklist */}
      <div className="px-6 md:px-8 pb-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header with shift columns */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-3 py-3 text-left text-xs font-bold w-12 border-r border-primary-foreground/20">No</th>
                  <th className="px-3 py-3 text-left text-xs font-bold w-36 border-r border-primary-foreground/20">Indikator</th>
                  <th className="px-3 py-3 text-left text-xs font-bold w-44 border-r border-primary-foreground/20">Deskripsi</th>
                  {SHIFTS.map((shift) => (
                    <th
                      key={shift.id}
                      className={cn(
                        "px-2 py-2 text-center text-[10px] font-bold border-r border-primary-foreground/20 last:border-r-0 min-w-[100px]",
                        activeShift === shift.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <button
                        onClick={() => setActiveShift(shift.id)}
                        className="w-full"
                      >
                        <span className="block leading-tight">{shift.label}</span>
                        {shift.time && (
                          <span className="block text-[10px] font-bold mt-1 opacity-80">{shift.time}</span>
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
                {/* OK/NO sub-header */}
                <tr className="bg-primary/90 text-primary-foreground">
                  <th colSpan={3} className="border-r border-primary-foreground/20" />
                  {SHIFTS.map((shift) => (
                    <th key={shift.id} className={cn(
                      "border-r border-primary-foreground/20 last:border-r-0",
                      activeShift === shift.id && "bg-accent/90"
                    )}>
                      <div className="flex text-[10px]">
                        <span className="flex-1 py-1.5 text-center font-semibold">OK</span>
                        <span className="flex-1 py-1.5 text-center font-semibold">NO</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PATROL_CATEGORIES.map((cat) => {
                  const isOpen = expandedCats[cat.id] !== false; // default open

                  return (
                    <>
                      {/* Category separator row */}
                      <tr key={`cat-${cat.id}`} className="bg-muted/50">
                        <td colSpan={3 + SHIFTS.length} className="px-3 py-2.5">
                          <button
                            onClick={() => setExpandedCats((p) => ({ ...p, [cat.id]: !(p[cat.id] !== false) }))}
                            className="flex items-center gap-2 w-full"
                          >
                            {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-xs font-bold text-foreground tracking-wide">{cat.name}</span>
                          </button>
                        </td>
                      </tr>
                      {isOpen && cat.items.map((item, idx) => {
                        const itemLetter = String.fromCharCode(97 + idx); // a, b, c...
                        const catPrefix = cat.id === "keselamatan" ? "I" : cat.id === "kemudahan" ? "II" : cat.id === "kesetaraan" ? "III" : cat.id === "kehandalan" ? "IV" : cat.id === "kenyamanan" ? "V" : "VI";
                        return (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-3 text-xs text-muted-foreground font-mono border-r border-border align-top">
                              {catPrefix}{itemLetter}
                            </td>
                            <td className="px-3 py-3 text-xs font-medium text-foreground leading-snug border-r border-border align-top">
                              {item.indicator}
                            </td>
                            <td className="px-3 py-3 text-xs text-muted-foreground leading-relaxed border-r border-border align-top">
                              {item.description}
                            </td>
                            {SHIFTS.map((shift) => {
                              const val = checks[shift.id]?.[item.id] || null;
                              const isActive = shift.id === activeShift;
                              return (
                                <td key={shift.id} className={cn(
                                  "border-r border-border last:border-r-0",
                                  isActive && "bg-accent/5"
                                )}>
                                  <div className="flex">
                                    {/* OK checkbox */}
                                    <button
                                      onClick={() => {
                                        setActiveShift(shift.id);
                                        setChecks((prev) => {
                                          const sc = prev[shift.id] || {};
                                          const cur = sc[item.id] || null;
                                          return { ...prev, [shift.id]: { ...sc, [item.id]: cur === "ok" ? null : "ok" } };
                                        });
                                      }}
                                      className="flex-1 flex items-center justify-center py-2.5"
                                    >
                                      <div className={cn(
                                        "h-6 w-6 rounded border-2 flex items-center justify-center transition-all",
                                        val === "ok"
                                          ? "bg-accent border-accent text-accent-foreground"
                                          : "border-border bg-card hover:border-accent/40"
                                      )}>
                                        {val === "ok" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                                      </div>
                                    </button>
                                    {/* NO checkbox */}
                                    <button
                                      onClick={() => {
                                        setActiveShift(shift.id);
                                        setChecks((prev) => {
                                          const sc = prev[shift.id] || {};
                                          const cur = sc[item.id] || null;
                                          return { ...prev, [shift.id]: { ...sc, [item.id]: cur === "no" ? null : "no" } };
                                        });
                                      }}
                                      className="flex-1 flex items-center justify-center py-2.5"
                                    >
                                      <div className={cn(
                                        "h-6 w-6 rounded border-2 flex items-center justify-center transition-all",
                                        val === "no"
                                          ? "bg-destructive border-destructive text-destructive-foreground"
                                          : "border-border bg-card hover:border-destructive/40"
                                      )}>
                                        {val === "no" && <X className="h-3.5 w-3.5" strokeWidth={3} />}
                                      </div>
                                    </button>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 md:px-8 pb-4">
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

      {/* TTD / Signature Section */}
      <div className="px-6 md:px-8 pb-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Tanda Tangan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Petugas Patrol
              </label>
              <SignaturePad canvasRef={sigPetugas} onClear={() => clearCanvas(sigPetugas)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Kepala Stasiun
              </label>
              <SignaturePad canvasRef={sigKepala} onClear={() => clearCanvas(sigKepala)} />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 md:px-8 pb-8">
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
  );
};

export default FormPatrol;
