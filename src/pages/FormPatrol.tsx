import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { STATIONS } from "@/data/stations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
      { id: "k1", indicator: "Perangkat dan fasilitas keselamatan berfungsi dengan baik", description: "APAR, Sprinkler, Smoke Detector, Hydrant, P3K dan lainnya" },
      { id: "k2", indicator: "Petunjuk penunjang keselamatan berfungsi dengan baik", description: "Ketersediaan, kesesuaian jumlah dan kondisi pemasangan pada Warden Box" },
      { id: "k3", indicator: "Fasilitas evakuasi berfungsi dengan baik", description: "Ketersediaan dan kondisi P3K dan perlengkapan penumpang" },
      { id: "k4", indicator: "Fasilitas penunjang evakuasi berfungsi dengan baik", description: "Signage Assembly Point, Signage Arah Evakuasi, SOP, LSD" },
      { id: "k5", indicator: "Perangkat dan fasilitas keselamatan berfungsi", description: "Ketersediaan fasilitas Pump Pemadam, Panel GPS, Marks & Written, Boarding Block" },
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
  {
    id: "kesetaraan",
    name: "KESETARAAN",
    items: [
      { id: "s1", indicator: "Fasilitas disabilitas tersedia", description: "Guiding block, ramp, dan braille sign berfungsi" },
      { id: "s2", indicator: "Ruang laktasi tersedia dan bersih", description: "Ketersediaan dan kebersihan ruang laktasi" },
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
];

const SHIFT_COLUMNS = [
  { label: "Handover Checklist", time: "06.00" },
  { label: "Checklist", time: "" },
  { label: "Handover Checklist", time: "14.00" },
  { label: "Checklist", time: "" },
  { label: "Handover Checklist", time: "22.00" },
  { label: "Checklist", time: "" },
  { label: "Window Time Closing", time: "" },
  { label: "Opening Checklist", time: "04.00" },
];

type CheckValue = "ok" | "no" | null;
type PatrolChecks = Record<string, Record<string, CheckValue[]>>;

const FormPatrol = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    keselamatan: true,
  });
  const [checks, setChecks] = useState<PatrolChecks>({});

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleCheck = (itemId: string, colIdx: number) => {
    setChecks((prev) => {
      const itemChecks = prev[itemId] || {};
      const colChecks = itemChecks[selectedStation] || new Array(SHIFT_COLUMNS.length).fill(null);
      const newColChecks = [...colChecks];
      newColChecks[colIdx] = newColChecks[colIdx] === "ok" ? "no" : newColChecks[colIdx] === "no" ? null : "ok";
      return {
        ...prev,
        [itemId]: { ...itemChecks, [selectedStation]: newColChecks },
      };
    });
  };

  const getCheck = (itemId: string, colIdx: number): CheckValue => {
    return checks[itemId]?.[selectedStation]?.[colIdx] || null;
  };

  const handleSubmit = () => {
    navigate(`/daily-check/patrol/submitted?station=${selectedStation}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-base text-card-foreground">Form Station Patrol</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Checklist pengecekan fasilitas stasiun per shift</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {PATROL_CATEGORIES.map((cat) => {
          const isExpanded = expandedCategories[cat.id];
          return (
            <div key={cat.id} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-bold text-card-foreground tracking-wide">
                  {cat.name}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-12">No</th>
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground min-w-[120px]">Indikator</th>
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground min-w-[160px]">Deskripsi</th>
                        {SHIFT_COLUMNS.map((col, i) => (
                          <th key={i} className="text-center px-2 py-2 font-semibold text-muted-foreground min-w-[60px]">
                            <div className="text-[10px] leading-tight">{col.label}</div>
                            {col.time && <div className="text-[10px] text-accent font-bold">{col.time}</div>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item, idx) => (
                        <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                          <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2.5 text-card-foreground font-medium">{item.indicator}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{item.description}</td>
                          {SHIFT_COLUMNS.map((_, colIdx) => {
                            const val = getCheck(item.id, colIdx);
                            return (
                              <td key={colIdx} className="text-center px-2 py-2.5">
                                <button
                                  onClick={() => toggleCheck(item.id, colIdx)}
                                  className={`h-7 w-7 rounded border-2 inline-flex items-center justify-center transition-all ${
                                    val === "ok"
                                      ? "bg-accent border-accent text-accent-foreground"
                                      : val === "no"
                                      ? "bg-destructive border-destructive text-destructive-foreground"
                                      : "border-border bg-card hover:border-accent/50"
                                  }`}
                                >
                                  {val === "ok" && <Check className="h-3.5 w-3.5" />}
                                  {val === "no" && <span className="text-xs font-bold">✕</span>}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div className="pt-6 pb-8 max-w-3xl">
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Submit Patrol
        </button>
      </div>
    </div>
  );
};

export default FormPatrol;
