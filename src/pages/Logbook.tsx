import { useState, useMemo } from "react";
import { useAutoSave } from "@/hooks/use-auto-save";
import { usePatrolRecords, ALL_ITEMS, SHIFTS } from "@/hooks/use-patrol-records";
import { Plus, Trash2, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATIONS } from "@/data/stations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const SECTIONS: { key: keyof ShiftData; label: string }[] = [
  { key: "gangguanFasilitas", label: "Gangguan Fasilitas/Kejadian/Pelanggaran/Insiden" },
  { key: "eventKunjungan", label: "Event/Kunjungan/Koordinasi Stakeholder" },
  { key: "pekerjaanArea", label: "Pekerjaan di Area Stasiun" },
  { key: "keluhan", label: "Keluhan/Apresiasi" },
];

const SHIFT_TABS = ["Shift 1", "Shift 2", "Shift 3", "Cash Handling"];

const Logbook = () => {
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [activeShift, setActiveShift] = useState("Shift 1");
  const [shiftData, setShiftData] = useState<Record<string, ShiftData>>(() => {
    const init: Record<string, ShiftData> = {};
    SHIFT_TABS.forEach((s) => {
      init[s] = createEmptyShift();
    });
    return init;
  });

  const { getCompletionStatus, addLogbookRecord, todayStr } = usePatrolRecords();

  const patrolStatus = useMemo(
    () => getCompletionStatus(selectedStation, todayStr, ALL_ITEMS.length, SHIFTS.length),
    [getCompletionStatus, selectedStation, todayStr]
  );

  const draftPayload = useMemo(() => ({ shiftData, selectedStation }), [shiftData, selectedStation]);
  const { clearDraft } = useAutoSave("logbook", draftPayload, (saved) => {
    setShiftData(saved.shiftData);
    if (saved.selectedStation) setSelectedStation(saved.selectedStation);
  });

  const updateEntry = (shift: string, section: keyof ShiftData, entryId: string, field: "time" | "description", value: string) => {
    setShiftData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: prev[shift][section].map((e) =>
          e.id === entryId ? { ...e, [field]: value } : e
        ),
      },
    }));
  };

  const addRow = (shift: string, section: keyof ShiftData) => {
    setShiftData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: [...prev[shift][section], { id: crypto.randomUUID(), time: "", description: "" }],
      },
    }));
  };

  const removeRow = (shift: string, section: keyof ShiftData, entryId: string) => {
    setShiftData((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [section]: prev[shift][section].filter((e) => e.id !== entryId),
      },
    }));
  };

  const canSubmit = patrolStatus.complete;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Form Patrol belum lengkap!", {
        description: `${patrolStatus.checked}/${patrolStatus.total} item tercentang (${patrolStatus.percentage}%)`,
      });
      return;
    }
    addLogbookRecord(selectedStation, todayStr);
    clearDraft();
    toast.success("Logbook berhasil disimpan!", {
      description: `Stasiun ${STATIONS.find((s) => s.id === selectedStation)?.name}`,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-base text-card-foreground">Logbook</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Catatan harian per shift stasiun</p>
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
          <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Export Logbook
          </button>
        </div>
      </div>

      {/* Patrol completion status banner */}
      <div className={cn(
        "rounded-lg border p-4 mb-6 flex items-start gap-3",
        canSubmit
          ? "border-green-500/30 bg-green-500/5"
          : "border-yellow-500/30 bg-yellow-500/5"
      )}>
        {canSubmit ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={cn("text-sm font-semibold", canSubmit ? "text-green-700" : "text-yellow-700")}>
            {canSubmit ? "Form Patrol lengkap — Logbook siap di-submit" : "Form Patrol belum lengkap"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {patrolStatus.checked}/{patrolStatus.total} item tercentang ({patrolStatus.percentage}%)
            {!canSubmit && " — Lengkapi Form Patrol terlebih dahulu sebelum submit Logbook"}
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2 max-w-xs">
            <div
              className={cn("h-full rounded-full transition-all", canSubmit ? "bg-green-500" : "bg-yellow-500")}
              style={{ width: `${patrolStatus.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeShift} onValueChange={setActiveShift}>
        <TabsList className="mb-4">
          {SHIFT_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-sm">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {SHIFT_TABS.map((shift) => (
          <TabsContent key={shift} value={shift}>
            <div className="space-y-5 max-w-4xl">
              {SECTIONS.map((section) => (
                <div key={section.key} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border">
                    <h3 className="text-sm font-bold text-card-foreground">{section.label}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {shiftData[shift]?.[section.key]?.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={entry.time}
                          onChange={(e) => updateEntry(shift, section.key, entry.id, "time", e.target.value)}
                          placeholder="Jam"
                          className="w-20 rounded-md border border-input bg-background px-2.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => updateEntry(shift, section.key, entry.id, "description", e.target.value)}
                          placeholder="Deskripsi kejadian..."
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => removeRow(shift, section.key, entry.id)}
                          className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addRow(shift, section.key)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors mt-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Row
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload section */}
              <div>
                <h3 className="text-sm font-bold text-card-foreground mb-1">2. Unggah Dokumentasi</h3>
                <p className="text-xs text-muted-foreground mb-3">Harap mengunggah dokumentasi sesuai kondisi yang terjadi</p>
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center py-12 gap-3">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
                  <button className="mt-2 px-6 py-2 rounded-lg border border-border bg-card text-sm font-medium text-card-foreground hover:bg-muted transition-colors">
                    Browse File
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 pb-8">
                <button className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Clear All
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={cn(
                    "px-8 py-2.5 rounded-lg text-sm font-semibold transition-all",
                    canSubmit
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Submit Logbook
                </button>
                {!canSubmit && (
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
    </div>
  );
};

export default Logbook;
