import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { STATIONS, TENANTS } from "@/data/stations";
import { useChecklistHistory } from "@/hooks/use-checklist-history";
import { ArrowLeft, List, Calendar, ClipboardCheck, Plus } from "lucide-react";

const StationHistory = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const station = STATIONS.find((s) => s.id === stationId);
  const tenants = TENANTS.filter((t) => t.stationId === stationId);
  const { getStationHistory, getEntry } = useChecklistHistory();

  const today = new Date().toISOString().split("T")[0];
  const entries = getStationHistory(stationId || "");
  const todayEntry = entries.find((e) => e.date === today);

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Stasiun tidak ditemukan</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 0) return { label: "Kosong", className: "bg-muted text-muted-foreground" };
    if (progress === 100) return { label: "Selesai", className: "bg-success/10 text-success" };
    return { label: "Draft", className: "bg-yellow-100 text-yellow-700" };
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);

  const getDateStr = (day: number) => {
    const y = calendarMonth.getFullYear();
    const m = String(calendarMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/daily-check/tenant")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-base text-card-foreground">{station.name}</h2>
          <p className="text-xs text-muted-foreground">{tenants.length} tenant · Riwayat Inspeksi</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`p-1.5 rounded-md transition-all ${view === "calendar" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CTA today */}
      <button
        onClick={() => navigate(`/station/${stationId}/checklist`)}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity mb-6"
      >
        <Plus className="h-4 w-4" />
        {todayEntry ? "Lanjutkan Pengecekan Hari Ini" : "Mulai Pengecekan Hari ini"}
      </button>

      {/* List view */}
      {view === "list" && (
        <div className="space-y-2">
          {entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Belum ada riwayat inspeksi
            </div>
          )}
          {entries.map((entry) => {
            const badge = getStatusBadge(entry.progress);
            const isToday = entry.date === today;
            return (
              <button
                key={entry.date}
                onClick={() => navigate(`/station/${stationId}/checklist?date=${entry.date}`)}
                className="w-full flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
              >
                <div className={`rounded-lg px-2.5 py-1.5 text-center min-w-[48px] ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="text-lg font-bold leading-none">
                    {new Date(entry.date).getDate()}
                  </div>
                  <div className="text-[10px] uppercase mt-0.5">
                    {new Date(entry.date).toLocaleDateString("id-ID", { month: "short" })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">{formatDate(entry.date)}</p>
                    {isToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">HARI INI</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Tenant dicek: {Math.round(entry.progress)}%
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              ‹
            </button>
            <span className="text-sm font-semibold">
              {calendarMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = getDateStr(day);
              const entry = getEntry(stationId || "", dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;

              return (
                <button
                  key={day}
                  disabled={isFuture}
                  onClick={() => !isFuture && navigate(`/station/${stationId}/checklist?date=${dateStr}`)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
                    ${isToday ? "bg-primary text-primary-foreground font-bold" : ""}
                    ${entry && !isToday ? "bg-success/15 text-success font-medium" : ""}
                    ${!entry && !isToday && !isFuture ? "hover:bg-muted text-card-foreground" : ""}
                    ${isFuture ? "text-muted-foreground/30 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {day}
                  {entry && <div className="h-1 w-1 rounded-full bg-current mt-0.5" />}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Klik tanggal untuk melihat atau membuat inspeksi
          </p>
        </div>
      )}
    </div>
  );
};

export default StationHistory;