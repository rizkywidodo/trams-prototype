import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATIONS, TENANTS } from "@/data/stations";
import type { Station } from "@/data/stations";
import { MapPin, Train } from "lucide-react";
import { useChecklistHistory } from "@/hooks/use-checklist-history";

const StationSelect = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { getEntry } = useChecklistHistory();

  const orderedStations = [...STATIONS].sort((a, b) => b.order - a.order);

  const today = new Date().toISOString().split("T")[0];
  const inspectedStations = STATIONS
    .map((s) => {
      const entry = getEntry(s.id, today);
      return entry ? { ...s, progress: entry.progress } : null;
    })
    .filter(Boolean) as (Station & { progress: number })[];
  const inspectedToday = inspectedStations.length;

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Map Column */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Train className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fase I — Jalur Utara–Selatan
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-6">13 Stasiun · Pilih stasiun untuk mulai inspeksi</p>

        {/* Route map */}
        <div className="relative pl-8">
          <div className="absolute left-[15px] top-3 bottom-3 w-[3px] rounded-full bg-primary/80" />
          <div className="space-y-0">
            {orderedStations.map((station, i) => {
              const tenantCount = TENANTS.filter((t) => t.stationId === station.id).length;
              const isHovered = hoveredId === station.id;
              const isTerminal = i === 0 || i === orderedStations.length - 1;
              const todayEntry = getEntry(station.id, today);

              return (
                <div key={station.id} className="relative">
                  <button
                    onClick={() => navigate(`/station/${station.id}`)}
                    onMouseEnter={() => setHoveredId(station.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group w-full text-left py-3 flex items-center gap-4 transition-all"
                  >
                    {/* Dot */}
                    <div className="absolute left-[-20px] flex items-center justify-center">
                      <div
                        className={`rounded-full border-[3px] transition-all duration-200 ${
                          todayEntry
                            ? "border-primary bg-primary h-4 w-4"
                            : isTerminal
                            ? "h-5 w-5 bg-primary border-primary"
                            : isHovered
                            ? "h-4 w-4 bg-primary border-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                            : "h-3.5 w-3.5 bg-card border-primary"
                        }`}
                      />
                    </div>

                    {/* Station info */}
                    <div
                      className={`flex items-center justify-between flex-1 rounded-lg px-4 py-2.5 transition-all duration-200 ${
                        isHovered
                          ? "bg-primary/10 border border-primary/20"
                          : "border border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate transition-colors ${
                          isHovered ? "text-primary" : "text-card-foreground"
                        } ${isTerminal ? "font-bold" : ""}`}>
                          {station.name}
                        </p>
                        {tenantCount > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {tenantCount} tenant{tenantCount !== 1 ? "s" : ""}
                            {todayEntry && (
                              <span className="ml-2 text-primary font-medium">
                                · {todayEntry.progress}% dicek
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {tenantCount > 0 && (
                        <div className={`shrink-0 ml-3 flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1 transition-all ${
                          isHovered
                            ? "bg-primary text-primary-foreground"
                            : todayEntry
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <MapPin className="h-3 w-3" />
                          {todayEntry ? "Lihat" : "Inspect"}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info sidebar */}
      <div className="lg:w-64 shrink-0 space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-card-foreground mb-3">Ringkasan Hari Ini</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Stasiun</span>
              <span className="text-sm font-bold text-card-foreground">{STATIONS.length}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Tenant</span>
              <span className="text-sm font-bold text-card-foreground">{TENANTS.length}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Sudah Dicek</span>
              <span className="text-sm font-bold text-primary">{inspectedToday}/{STATIONS.length}</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${STATIONS.length === 0 ? 0 : Math.round((inspectedToday / STATIONS.length) * 100)}%` }}
            />
          </div>
        </div>

        {inspectedStations.length > 0 ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-card-foreground mb-3">Sudah Dicek😁</h3>
            <div className="space-y-2">
              {inspectedStations.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-xs text-card-foreground truncate flex-1">{s.name}</span>
                  <span className={`text-xs font-medium ml-2 ${s.progress === 100 ? "text-primary" : "text-yellow-600"}`}>
                    {s.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">Belum ada stasiun yang diinspeksi hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationSelect;