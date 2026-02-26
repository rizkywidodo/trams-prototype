import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATIONS, TENANTS } from "@/data/stations";
import { MapPin, Train } from "lucide-react";

const StationSelect = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Reverse so Bundaran HI is at top (north) and Lebak Bulus at bottom (south)
  const orderedStations = [...STATIONS].sort((a, b) => b.order - a.order);

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Map Column */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Train className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fase I — Jalur Utara–Selatan
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-6">13 Stasiun · Pilih stasiun untuk mulai inspeksi</p>

        {/* Route map */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-3 bottom-3 w-[3px] rounded-full bg-accent/80" />

          <div className="space-y-0">
            {orderedStations.map((station, i) => {
              const tenantCount = TENANTS.filter((t) => t.stationId === station.id).length;
              const isHovered = hoveredId === station.id;
              const isTerminal = i === 0 || i === orderedStations.length - 1;

              return (
                <div key={station.id} className="relative">
                  {/* Station node */}
                  <button
                    onClick={() => navigate(`/station/${station.id}`)}
                    onMouseEnter={() => setHoveredId(station.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group w-full text-left py-3 flex items-center gap-4 transition-all"
                  >
                    {/* Dot */}
                    <div className="absolute left-[-20px] flex items-center justify-center">
                      <div
                        className={`rounded-full border-[3px] border-accent transition-all duration-200 ${
                          isTerminal
                            ? "h-5 w-5 bg-accent"
                            : isHovered
                            ? "h-4 w-4 bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.5)]"
                            : "h-3.5 w-3.5 bg-card"
                        }`}
                      />
                    </div>

                    {/* Station info */}
                    <div
                      className={`flex items-center justify-between flex-1 rounded-lg px-4 py-2.5 transition-all duration-200 ${
                        isHovered
                          ? "bg-accent/10 border border-accent/20"
                          : "border border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate transition-colors ${
                            isHovered ? "text-accent" : "text-card-foreground"
                          } ${isTerminal ? "font-bold" : ""}`}
                        >
                          {station.name}
                        </p>
                        {tenantCount > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {tenantCount} tenant{tenantCount !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      {tenantCount > 0 && (
                        <div
                          className={`shrink-0 ml-3 flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1 transition-all ${
                            isHovered
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          Inspect
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
              <span className="text-sm font-bold text-accent">0/{STATIONS.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-card-foreground mb-2">Legenda</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 rounded-full bg-accent border-[3px] border-accent" />
              <span className="text-xs text-muted-foreground">Stasiun Terminal</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-card border-[3px] border-accent ml-0.5" />
              <span className="text-xs text-muted-foreground">Stasiun Transit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-[3px] rounded-full bg-accent/80 ml-1.5" />
              <span className="text-xs text-muted-foreground">Jalur MRT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationSelect;
