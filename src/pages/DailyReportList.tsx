import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatrolRecords, ALL_ITEMS, SHIFTS } from "@/hooks/use-patrol-records";
import { STATIONS } from "@/data/stations";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar as CalendarIcon, List, Plus, FileText, BookOpen,
  CheckCircle2, MapPin, ChevronRight, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const DailyReportList = () => {
  const navigate = useNavigate();
  const { records, getCompletionStatus, getLogbookForDate, todayStr } = usePatrolRecords();
  const [selectedStation, setSelectedStation] = useState<string>(STATIONS[0].id);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  // Collect all unique dates that have records for this station, plus today
  const reportDates = useMemo(() => {
    const dateSet = new Set<string>();
    dateSet.add(todayStr);
    records
      .filter((r) => r.stationId === selectedStation)
      .forEach((r) => dateSet.add(r.date));
    return Array.from(dateSet).sort().reverse();
  }, [records, selectedStation, todayStr]);

  const getStatusForDate = (dateStr: string) => {
    const patrol = getCompletionStatus(selectedStation, dateStr, ALL_ITEMS.length, SHIFTS.length);
    const logbook = getLogbookForDate(selectedStation, dateStr);
    const isComplete = patrol.complete && !!logbook;
    const isDraft = patrol.checked > 0 && !isComplete;
    return { patrol, logbook, isComplete, isDraft };
  };

  const handleOpenReport = (dateStr: string) => {
    navigate(`/daily-check/report/${dateStr}?station=${selectedStation}`);
  };

  // Calendar modifiers for dates with data
  const datesWithData = useMemo(() => {
    return reportDates
      .filter((d) => {
        const s = getStatusForDate(d);
        return s.patrol.checked > 0;
      })
      .map((d) => parseISO(d));
  }, [reportDates]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">
          Daily Report
        </p>
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

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                view === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                view === "calendar" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CTA: Buat Laporan Hari Ini */}
      <div className="px-6 md:px-8 pb-4">
        <button
          onClick={() => handleOpenReport(todayStr)}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl py-4 bg-accent text-accent-foreground font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Buat / Lanjutkan Laporan Hari Ini
        </button>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 pb-8">
        {view === "list" ? (
          <div className="space-y-2">
            {reportDates.map((dateStr) => {
              const { patrol, logbook, isComplete, isDraft } = getStatusForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleOpenReport(dateStr)}
                  className="w-full rounded-lg border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex flex-col items-center justify-center shrink-0",
                      isToday ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    )}>
                      <span className="text-lg font-bold leading-none">
                        {format(parseISO(dateStr), "dd")}
                      </span>
                      <span className="text-[10px] font-medium uppercase">
                        {format(parseISO(dateStr), "MMM")}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(parseISO(dateStr), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                        {isToday && (
                          <span className="ml-2 text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                            HARI INI
                          </span>
                        )}
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
                    {isComplete ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                      </span>
                    ) : isDraft ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-600">
                        Draft
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        Kosong
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Calendar View */
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={(date) => {
                if (date) {
                  setCalendarDate(date);
                  handleOpenReport(format(date, "yyyy-MM-dd"));
                }
              }}
              modifiers={{ hasData: datesWithData }}
              modifiersStyles={{
                hasData: {
                  fontWeight: 700,
                  backgroundColor: "hsl(var(--accent) / 0.15)",
                  color: "hsl(var(--accent))",
                  borderRadius: "8px",
                },
              }}
              className="mx-auto"
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Klik tanggal untuk melihat atau membuat laporan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportList;
