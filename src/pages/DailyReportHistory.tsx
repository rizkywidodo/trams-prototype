import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, subMonths, addMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { STATIONS } from "@/data/stations";
import { CalendarDays, List, ChevronLeft, ChevronRight, FileText, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReportStatus = "submitted" | "draft" | "empty";

interface DailyReport {
  date: string; // YYYY-MM-DD
  stationId: string;
  patrolStatus: ReportStatus;
  logbookStatus: ReportStatus;
  patrolShiftsCompleted: number;
  patrolShiftsTotal: number;
  logbookShiftsCompleted: number;
  logbookShiftsTotal: number;
  submittedAt?: string;
}

// Generate mock data for the current month
const generateMockReports = (stationId: string): DailyReport[] => {
  const today = new Date();
  const reports: DailyReport[] = [];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "yyyy-MM-dd");

    if (i === 0) {
      // Today - draft
      reports.push({
        date: dateStr,
        stationId,
        patrolStatus: "draft",
        logbookStatus: "draft",
        patrolShiftsCompleted: 2,
        patrolShiftsTotal: 10,
        logbookShiftsCompleted: 1,
        logbookShiftsTotal: 4,
      });
    } else if (i <= 2) {
      // Recent - some submitted
      reports.push({
        date: dateStr,
        stationId,
        patrolStatus: "submitted",
        logbookStatus: i === 1 ? "submitted" : "draft",
        patrolShiftsCompleted: 10,
        patrolShiftsTotal: 10,
        logbookShiftsCompleted: i === 1 ? 4 : 2,
        logbookShiftsTotal: 4,
        submittedAt: i === 1 ? `${dateStr}T16:30:00` : undefined,
      });
    } else if (Math.random() > 0.15) {
      // Older days - mostly submitted
      reports.push({
        date: dateStr,
        stationId,
        patrolStatus: "submitted",
        logbookStatus: "submitted",
        patrolShiftsCompleted: 10,
        patrolShiftsTotal: 10,
        logbookShiftsCompleted: 4,
        logbookShiftsTotal: 4,
        submittedAt: `${dateStr}T17:00:00`,
      });
    }
  }

  return reports;
};

const statusConfig = {
  submitted: { label: "Submitted", icon: CheckCircle2, className: "text-green-600 bg-green-50" },
  draft: { label: "Draft", icon: Clock, className: "text-yellow-600 bg-yellow-50" },
  empty: { label: "Belum diisi", icon: AlertCircle, className: "text-muted-foreground bg-muted/50" },
};

const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

const DailyReportHistory = () => {
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const reports = useMemo(() => generateMockReports(selectedStation), [selectedStation]);

  const getReportForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return reports.find((r) => r.date === dateStr);
  };

  const getOverallStatus = (report?: DailyReport): ReportStatus => {
    if (!report) return "empty";
    if (report.patrolStatus === "submitted" && report.logbookStatus === "submitted") return "submitted";
    return "draft";
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-base text-card-foreground">Riwayat Laporan Harian</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Form Patrol & Logbook per hari</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === "calendar" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Kalender
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Form Patrol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Logbook</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Waktu Submit</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.slice().reverse().map((report) => {
                const overall = getOverallStatus(report);
                return (
                  <tr key={report.date} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-card-foreground">
                        {format(new Date(report.date), "EEEE, dd MMM yyyy", { locale: idLocale })}
                      </div>
                      {isToday(new Date(report.date)) && (
                        <span className="text-[10px] font-bold text-primary">HARI INI</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <StatusBadge status={report.patrolStatus} />
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {report.patrolShiftsCompleted}/{report.patrolShiftsTotal} shift
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <StatusBadge status={report.logbookStatus} />
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {report.logbookShiftsCompleted}/{report.logbookShiftsTotal} shift
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={overall} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {report.submittedAt
                        ? format(new Date(report.submittedAt), "HH:mm", { locale: idLocale })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-card-foreground hover:bg-muted transition-colors">
                        Lihat
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <h3 className="text-sm font-bold text-card-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: idLocale })}
            </h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {daysInMonth.map((day) => {
                const report = getReportForDate(day);
                const overall = getOverallStatus(report);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 text-sm transition-colors hover:bg-muted/50 ${
                      today ? "border-primary ring-1 ring-primary" : "border-border"
                    } ${overall === "submitted" ? "bg-green-50/50" : overall === "draft" ? "bg-yellow-50/50" : "bg-card"}`}
                  >
                    <span className={`text-sm font-medium ${today ? "text-primary" : "text-card-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    {report && (
                      <div className="flex gap-0.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          report.patrolStatus === "submitted" ? "bg-green-500" : report.patrolStatus === "draft" ? "bg-yellow-500" : "bg-muted-foreground/30"
                        }`} title="Patrol" />
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          report.logbookStatus === "submitted" ? "bg-green-500" : report.logbookStatus === "draft" ? "bg-yellow-500" : "bg-muted-foreground/30"
                        }`} title="Logbook" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" /> Submitted
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-yellow-500" /> Draft
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Belum diisi
              </div>
              <div className="text-xs text-muted-foreground ml-2">● Patrol &nbsp; ● Logbook</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportHistory;
