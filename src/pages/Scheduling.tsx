import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Search, Download, Upload, RefreshCw, CalendarIcon, Wand2, ArrowLeftRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useShiftSwap } from "@/hooks/use-shift-swap";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const SHIFT_TYPES: Record<string, { bg: string; text: string }> = {
  W1: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  W2: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  W3: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  W4: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  W5: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  W6: { bg: "bg-[hsl(215_60%_28%/0.12)]", text: "text-[hsl(215_60%_28%)]" },
  OFF: { bg: "bg-muted", text: "text-muted-foreground" },
  E1: { bg: "bg-[hsl(170_55%_42%/0.15)]", text: "text-[hsl(170_55%_42%)]" },
  E2: { bg: "bg-[hsl(170_55%_42%/0.15)]", text: "text-[hsl(170_55%_42%)]" },
  "E2-ST": { bg: "bg-[hsl(38_92%_55%/0.15)]", text: "text-[hsl(38_70%_40%)]" },
  "E3-ST": { bg: "bg-[hsl(38_92%_55%/0.15)]", text: "text-[hsl(38_70%_40%)]" },
  "W1-ST": { bg: "bg-[hsl(38_92%_55%/0.15)]", text: "text-[hsl(38_70%_40%)]" },
  "SIM 1": { bg: "bg-[hsl(260_50%_55%/0.12)]", text: "text-[hsl(260_50%_45%)]" },
  "BHI 1": { bg: "bg-[hsl(0_72%_55%/0.12)]", text: "text-[hsl(0_72%_45%)]" },
  "BHI 3": { bg: "bg-[hsl(0_72%_55%/0.12)]", text: "text-[hsl(0_72%_45%)]" },
  "BLM 1": { bg: "bg-[hsl(0_72%_55%/0.12)]", text: "text-[hsl(0_72%_45%)]" },
  "BLM 3": { bg: "bg-[hsl(0_72%_55%/0.12)]", text: "text-[hsl(0_72%_45%)]" },
  ASM: { bg: "bg-[hsl(0_72%_55%/0.2)]", text: "text-[hsl(0_72%_40%)]" },
};

const ALL_SHIFT_OPTIONS = ["W1","W2","W3","W4","W5","W6","OFF","E1","E2","E2-ST","E3-ST","W1-ST","SIM 1","BHI 1","BHI 3","BLM 1","BLM 3","ASM"];

const EMPLOYEES = [
  { nik: "10233", nama: "Pery Pendryan", posisi: "Train Driver" },
  { nik: "10225", nama: "Fajrul Fadli Zaka", posisi: "Train Driver" },
  { nik: "10126", nama: "Mohammad Luthfi Kurniawan", posisi: "Train Driver" },
  { nik: "213101015", nama: "Hani Miftahul Rozak", posisi: "Train Driver" },
  { nik: "10237", nama: "Bobby Raza Alamsyah", posisi: "Train Driver" },
  { nik: "217101307", nama: "Almas Maula Afiqi", posisi: "Train Driver" },
  { nik: "218031384", nama: "Ibrahim Syindu Jayawardana", posisi: "Co-Driver" },
  { nik: "10240", nama: "Andi Prasetyo", posisi: "Co-Driver" },
  { nik: "10245", nama: "Rizky Maulana", posisi: "Train Driver" },
  { nik: "10250", nama: "Dewi Sartika", posisi: "Co-Driver" },
];

function generateSchedule(employees: typeof EMPLOYEES, startDate: Date, days: number) {
  const schedule: Record<string, Record<string, string>> = {};
  const shifts = ["W1","W2","W3","W4","W5","W6","OFF","E1","E2","E2-ST","SIM 1","BHI 1","BLM 3","ASM"];
  employees.forEach((emp, empIdx) => {
    schedule[emp.nik] = {};
    for (let d = 0; d < days; d++) {
      const dateKey = format(addDays(startDate, d), "yyyy-MM-dd");
      const idx = (empIdx * 7 + d * 3 + empIdx + d) % shifts.length;
      schedule[emp.nik][dateKey] = shifts[idx];
    }
  });
  return schedule;
}

const Scheduling = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addRequest, getPendingCount } = useShiftSwap();
  const [pendingCount, setPendingCount] = useState(getPendingCount());
  const [swapModal, setSwapModal] = useState<{ nik: string; date: string; shift: string } | null>(null);
  const [swapTargetNik, setSwapTargetNik] = useState("");
  const [swapTargetDate, setSwapTargetDate] = useState("");
  const [swapReason, setSwapReason] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 1, 25));
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 2, 3));
  const [searchName, setSearchName] = useState("");
  const [editingCell, setEditingCell] = useState<{ nik: string; date: string } | null>(null);
  const [schedule, setSchedule] = useState(() => generateSchedule(EMPLOYEES, new Date(2026, 1, 25), 14));

  const days = useMemo(() => {
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diff, 31));
  }, [startDate, endDate]);

  const dateColumns = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const date = addDays(startDate, i);
      return {
        key: format(date, "yyyy-MM-dd"),
        day: format(date, "EEE", { locale: localeId }),
        date: format(date, "dd", { locale: localeId }),
        month: format(date, "MMM", { locale: localeId }),
        isSunday: date.getDay() === 0,
      };
    });
  }, [startDate, days]);

  const filteredEmployees = useMemo(() => {
    if (!searchName.trim()) return EMPLOYEES;
    const q = searchName.toLowerCase();
    return EMPLOYEES.filter(e => e.nama.toLowerCase().includes(q) || e.nik.includes(q));
  }, [searchName]);

  const handleShiftSelect = (shift: string) => {
    if (!editingCell) return;
    setSchedule(prev => ({
      ...prev,
      [editingCell.nik]: { ...prev[editingCell.nik], [editingCell.date]: shift },
    }));
    setEditingCell(null);
  };

  const handleReload = () => {
    setSchedule(generateSchedule(EMPLOYEES, startDate, days));
    toast({ title: "Schedule reloaded", description: "Data jadwal berhasil di-refresh." });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-foreground">Scheduling — Train Driver</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Coming soon" })}>
            <Wand2 className="h-3.5 w-3.5 mr-1" /> Template
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs relative" onClick={() => navigate("/scheduling/approvals")}>
            <Bell className="h-3.5 w-3.5 mr-1" /> Approvals
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Coming soon" })}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Coming soon" })}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleReload}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reload
          </Button>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card rounded-lg border border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Dari</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-normal w-[110px] justify-start">
                <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                {format(startDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Sampai</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-normal w-[110px] justify-start">
                <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                {format(endDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Cari nama / NIK..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
        <Button size="sm" className="h-7 px-3 text-xs" onClick={handleReload}>
          <Search className="h-3 w-3 mr-1" /> Filter
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                <TableHead className="sticky left-0 z-20 bg-primary text-primary-foreground text-[11px] font-semibold w-10 text-center px-2">No</TableHead>
                <TableHead className="sticky left-10 z-20 bg-primary text-primary-foreground text-[11px] font-semibold w-24 px-2">NIK</TableHead>
                <TableHead className="sticky left-[136px] z-20 bg-primary text-primary-foreground text-[11px] font-semibold min-w-[180px] px-2">Nama</TableHead>
                <TableHead className="sticky left-[316px] z-20 bg-primary text-primary-foreground text-[11px] font-semibold w-28 px-2">Posisi</TableHead>
                {dateColumns.map((col) => (
                  <TableHead key={col.key} className={`text-center text-[10px] font-semibold px-1 min-w-[56px] text-primary-foreground ${col.isSunday ? "bg-[hsl(0_72%_55%/0.3)]" : ""}`}>
                    <div className="leading-tight">
                      <div className="uppercase">{col.day}</div>
                      <div className="text-[11px] font-bold">{col.date}</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <TableRow key={emp.nik} className={`hover:bg-accent/5 ${isEven ? "bg-card" : "bg-muted/30"}`}>
                    <TableCell className={`sticky left-0 z-10 text-center text-xs font-medium px-2 py-1.5 ${isEven ? "bg-card" : "bg-muted/30"}`}>{idx + 1}</TableCell>
                    <TableCell className={`sticky left-10 z-10 font-mono text-[11px] font-medium px-2 py-1.5 ${isEven ? "bg-card" : "bg-muted/30"}`}>{emp.nik}</TableCell>
                    <TableCell className={`sticky left-[136px] z-10 text-xs font-medium px-2 py-1.5 whitespace-nowrap ${isEven ? "bg-card" : "bg-muted/30"}`}>{emp.nama}</TableCell>
                    <TableCell className={`sticky left-[316px] z-10 text-[11px] text-muted-foreground px-2 py-1.5 ${isEven ? "bg-card" : "bg-muted/30"}`}>{emp.posisi}</TableCell>
                    {dateColumns.map((col) => {
                      const shift = schedule[emp.nik]?.[col.key] || "";
                      const isEditing = editingCell?.nik === emp.nik && editingCell?.date === col.key;
                      const style = SHIFT_TYPES[shift];
                      return (
                        <TableCell key={col.key} className={`text-center px-0.5 py-1 ${col.isSunday ? "bg-[hsl(0_72%_55%/0.04)]" : ""}`}>
                          {isEditing ? (
                            <Select onValueChange={handleShiftSelect} defaultOpen>
                              <SelectTrigger className="h-7 w-[58px] text-[10px] mx-auto">
                                <SelectValue placeholder={shift} />
                              </SelectTrigger>
                              <SelectContent>
                                {ALL_SHIFT_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <button
                              onClick={() => setEditingCell({ nik: emp.nik, date: col.key })}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setSwapModal({ nik: emp.nik, date: col.key, shift });
                                setSwapTargetNik("");
                                setSwapTargetDate(col.key);
                                setSwapReason("");
                              }}
                              className={`inline-flex items-center justify-center h-7 w-[58px] rounded text-[11px] font-semibold transition-all hover:ring-1 hover:ring-ring/40 cursor-pointer ${style ? `${style.bg} ${style.text}` : "bg-muted/50 text-muted-foreground"}`}
                              title="Klik untuk edit · Klik kanan untuk tukar shift"
                            >
                              {shift}
                            </button>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground mr-1">Keterangan:</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[hsl(215_60%_28%/0.12)]" /> Work Shift</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted border border-border" /> OFF</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[hsl(170_55%_42%/0.15)]" /> Evening</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[hsl(38_92%_55%/0.15)]" /> Standby</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[hsl(260_50%_55%/0.12)]" /> Simulasi</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[hsl(0_72%_55%/0.12)]" /> BHI/BLM/ASM</span>
      </div>

      {/* Swap Modal */}
      <Dialog open={!!swapModal} onOpenChange={() => setSwapModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              Request Tukar Jadwal
            </DialogTitle>
          </DialogHeader>
          {swapModal && (() => {
            const requestor = EMPLOYEES.find((e) => e.nik === swapModal.nik);
            const target = EMPLOYEES.find((e) => e.nik === swapTargetNik);
            const targetShift = target ? schedule[target.nik]?.[swapTargetDate] : "";
            const availableEmployees = EMPLOYEES.filter((e) => e.nik !== swapModal.nik);

            return (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <p className="text-[10px] font-semibold text-primary uppercase mb-1">Jadwal Anda</p>
                  <p className="text-sm font-bold text-foreground">{requestor?.nama}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(swapModal.date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                  </p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold">
                    {swapModal.shift}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Tukar dengan</label>
                  <select
                    value={swapTargetNik}
                    onChange={(e) => setSwapTargetNik(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Pilih karyawan...</option>
                    {availableEmployees.map((e) => (
                      <option key={e.nik} value={e.nik}>
                        {e.nama} — {e.posisi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Tanggal yang ditukar</label>
                  <select
                    value={swapTargetDate}
                    onChange={(e) => setSwapTargetDate(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {dateColumns.map((col) => (
                      <option key={col.key} value={col.key}>
                        {format(new Date(col.key), "EEEE, dd MMM yyyy", { locale: localeId })}
                      </option>
                    ))}
                  </select>
                </div>

                {swapTargetNik && swapTargetDate && (
                  <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">Shift Anda</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-primary/15 text-primary text-sm font-bold">
                        {swapModal.shift}
                      </span>
                    </div>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">Shift {target?.nama.split(" ")[0]}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-primary/15 text-primary text-sm font-bold">
                        {targetShift || "-"}
                      </span>
                    </div>
                  </div>
                )}

                {swapTargetNik && targetShift === "OFF" && (
                  <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
                    ⚠️ Karyawan tersebut sedang OFF di tanggal yang dipilih
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-foreground">Alasan tukar</label>
                  <textarea
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    placeholder="Jelaskan alasan tukar jadwal..."
                    className="w-full mt-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={2}
                  />
                </div>

                <button
                  disabled={!swapTargetNik || !swapReason.trim()}
                  onClick={() => {
                    if (!requestor || !target) return;
                    addRequest({
                      requestorNik: swapModal.nik,
                      requestorName: requestor.nama,
                      requestorDate: swapModal.date,
                      requestorShift: swapModal.shift,
                      targetNik: swapTargetNik,
                      targetName: target.nama,
                      targetDate: swapTargetDate,
                      targetShift: targetShift || "",
                      reason: swapReason,
                    });
                    setPendingCount(getPendingCount());
                    toast({ title: "Request tukar jadwal terkirim!", description: "Menunggu approval dari planner." });
                    setSwapModal(null);
                  }}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Kirim Request
                </button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scheduling;