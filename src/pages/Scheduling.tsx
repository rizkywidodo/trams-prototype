import { useState, useMemo } from "react";
import { format, addDays, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Search, Download, Upload, RefreshCw, CalendarIcon, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

// Shift types with color coding
const SHIFT_TYPES: Record<string, { bg: string; text: string; label: string }> = {
  W1: { bg: "bg-background", text: "text-foreground", label: "W1" },
  W2: { bg: "bg-background", text: "text-foreground", label: "W2" },
  W3: { bg: "bg-background", text: "text-foreground", label: "W3" },
  W4: { bg: "bg-background", text: "text-foreground", label: "W4" },
  W5: { bg: "bg-background", text: "text-foreground", label: "W5" },
  W6: { bg: "bg-background", text: "text-foreground", label: "W6" },
  OFF: { bg: "bg-muted", text: "text-muted-foreground", label: "OFF" },
  E1: { bg: "bg-secondary", text: "text-secondary-foreground", label: "E1" },
  E2: { bg: "bg-secondary", text: "text-secondary-foreground", label: "E2" },
  "E2-ST": { bg: "hsl(var(--success) / 0.15)", text: "text-foreground", label: "E2-ST" },
  "E3-ST": { bg: "hsl(var(--success) / 0.15)", text: "text-foreground", label: "E3-ST" },
  "W1-ST": { bg: "hsl(var(--success) / 0.15)", text: "text-foreground", label: "W1-ST" },
  "SIM 1": { bg: "hsl(var(--warning) / 0.15)", text: "text-foreground", label: "SIM 1" },
  "BHI 1": { bg: "hsl(var(--destructive) / 0.12)", text: "text-foreground", label: "BHI 1" },
  "BHI 3": { bg: "hsl(var(--destructive) / 0.12)", text: "text-foreground", label: "BHI 3" },
  "BLM 1": { bg: "hsl(var(--destructive) / 0.12)", text: "text-foreground", label: "BLM 1" },
  "BLM 3": { bg: "hsl(var(--destructive) / 0.12)", text: "text-foreground", label: "BLM 3" },
  ASM: { bg: "hsl(var(--destructive) / 0.2)", text: "text-foreground", label: "ASM" },
};

const ALL_SHIFT_OPTIONS = ["W1","W2","W3","W4","W5","W6","OFF","E1","E2","E2-ST","E3-ST","W1-ST","SIM 1","BHI 1","BHI 3","BLM 1","BLM 3","ASM"];

// Dummy employees
const EMPLOYEES = [
  { nik: "10233", nama: "Pery Pendryan" },
  { nik: "10225", nama: "Fajrul Fadli Zaka" },
  { nik: "10126", nama: "Mohammad Luthfi Kurniawan" },
  { nik: "213101015", nama: "Hani Miftahul Rozak" },
  { nik: "10237", nama: "Bobby Raza Alamsyah" },
  { nik: "217101307", nama: "Almas Maula Afiqi" },
  { nik: "218031384", nama: "Ibrahim Syindu Jayawardana" },
  { nik: "10240", nama: "Andi Prasetyo" },
  { nik: "10245", nama: "Rizky Maulana" },
  { nik: "10250", nama: "Dewi Sartika" },
];

function generateSchedule(employees: typeof EMPLOYEES, startDate: Date, days: number) {
  const schedule: Record<string, Record<string, string>> = {};
  const shifts = ["W1","W2","W3","W4","W5","W6","OFF","E1","E2","E2-ST","SIM 1","BHI 1","BLM 3","ASM"];
  
  employees.forEach((emp, empIdx) => {
    schedule[emp.nik] = {};
    for (let d = 0; d < days; d++) {
      const dateKey = format(addDays(startDate, d), "yyyy-MM-dd");
      // Pseudo-random but deterministic
      const idx = (empIdx * 7 + d * 3 + empIdx + d) % shifts.length;
      schedule[emp.nik][dateKey] = shifts[idx];
    }
  });
  return schedule;
}

const Scheduling = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 1, 25)); // 25 Feb 2026
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 2, 3)); // 3 Mar 2026
  const [searchName, setSearchName] = useState("");
  const [editingCell, setEditingCell] = useState<{ nik: string; date: string } | null>(null);

  const days = useMemo(() => {
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diff, 31));
  }, [startDate, endDate]);

  const dateColumns = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const date = addDays(startDate, i);
      return { key: format(date, "yyyy-MM-dd"), label: format(date, "dd MMM", { locale: localeId }) };
    });
  }, [startDate, days]);

  const [schedule, setSchedule] = useState(() => generateSchedule(EMPLOYEES, new Date(2026, 1, 25), 14));

  const filteredEmployees = useMemo(() => {
    if (!searchName.trim()) return EMPLOYEES;
    const q = searchName.toLowerCase();
    return EMPLOYEES.filter(e => e.nama.toLowerCase().includes(q) || e.nik.includes(q));
  }, [searchName]);

  const handleCellClick = (nik: string, dateKey: string) => {
    setEditingCell({ nik, date: dateKey });
  };

  const handleShiftSelect = (shift: string) => {
    if (!editingCell) return;
    setSchedule(prev => ({
      ...prev,
      [editingCell.nik]: {
        ...prev[editingCell.nik],
        [editingCell.date]: shift,
      },
    }));
    setEditingCell(null);
  };

  const handleReload = () => {
    setSchedule(generateSchedule(EMPLOYEES, startDate, days));
    toast({ title: "Schedule reloaded", description: "Data jadwal berhasil di-refresh." });
  };

  const getShiftStyle = (shift: string) => {
    const type = SHIFT_TYPES[shift];
    if (!type) return {};
    // For styles using hsl() directly, return inline
    if (type.bg.startsWith("hsl")) {
      return { backgroundColor: type.bg };
    }
    return {};
  };

  const getShiftClasses = (shift: string) => {
    const type = SHIFT_TYPES[shift];
    if (!type) return "bg-muted/50 text-muted-foreground";
    if (type.bg.startsWith("hsl")) return type.text;
    return `${type.bg} ${type.text}`;
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Jadwal Train Driver</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola jadwal shift masinis harian</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming soon", description: "Fitur auto-assign template sedang dikembangkan." })}>
            <Wand2 className="h-4 w-4 mr-1.5" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming soon", description: "Fitur import Excel sedang dikembangkan." })}>
            <Upload className="h-4 w-4 mr-1.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming soon", description: "Fitur export Excel sedang dikembangkan." })}>
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button onClick={handleReload} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Reload
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-card rounded-xl border border-border p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Dari Tanggal *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-40 justify-start font-normal">
                <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {format(startDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-40 justify-start font-normal">
                <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {format(endDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Nama</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIK..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <Button variant="default" size="sm" onClick={handleReload}>
          <Search className="h-3.5 w-3.5 mr-1.5" />
          Filter
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/80 backdrop-blur-sm z-10 w-28 text-xs font-semibold">NIK</TableHead>
                <TableHead className="sticky left-28 bg-muted/80 backdrop-blur-sm z-10 min-w-[200px] text-xs font-semibold">Nama</TableHead>
                {dateColumns.map((col) => (
                  <TableHead key={col.key} className="text-center text-xs font-semibold min-w-[72px]">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.nik} className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-card z-10 font-mono text-xs font-medium">{emp.nik}</TableCell>
                  <TableCell className="sticky left-28 bg-card z-10 text-sm font-medium">{emp.nama}</TableCell>
                  {dateColumns.map((col) => {
                    const shift = schedule[emp.nik]?.[col.key] || "";
                    const isEditing = editingCell?.nik === emp.nik && editingCell?.date === col.key;

                    return (
                      <TableCell key={col.key} className="text-center p-1">
                        {isEditing ? (
                          <Select onValueChange={handleShiftSelect} defaultOpen>
                            <SelectTrigger className="h-8 w-[70px] text-xs mx-auto">
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
                            onClick={() => handleCellClick(emp.nik, col.key)}
                            className={`inline-flex items-center justify-center h-8 w-[70px] rounded-md text-xs font-medium transition-colors hover:ring-2 hover:ring-ring/30 cursor-pointer ${getShiftClasses(shift)}`}
                            style={getShiftStyle(shift)}
                            title="Klik untuk edit shift"
                          >
                            {shift}
                          </button>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Keterangan Warna</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-background border border-border" />
            <span className="text-xs text-muted-foreground">Normal Shift</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">OFF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: "hsl(152 55% 42% / 0.15)" }} />
            <span className="text-xs text-muted-foreground">Standby (ST)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: "hsl(38 92% 55% / 0.15)" }} />
            <span className="text-xs text-muted-foreground">Simulasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: "hsl(0 72% 55% / 0.12)" }} />
            <span className="text-xs text-muted-foreground">BHI / BLM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
