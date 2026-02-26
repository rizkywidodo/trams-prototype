import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATIONS, TENANTS } from "@/data/stations";
import { MapPin, ChevronRight, Train } from "lucide-react";

const StationSelect = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = STATIONS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari stasiun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {/* Station Line */}
      <div className="flex items-center gap-2 mb-4">
        <Train className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Jalur Utara–Selatan
        </span>
      </div>

      {/* Station List */}
      <div className="space-y-2 max-w-2xl">
        {filtered.map((station, i) => {
          const tenantCount = TENANTS.filter(
            (t) => t.stationId === station.id
          ).length;
          return (
            <button
              key={station.id}
              onClick={() => navigate(`/station/${station.id}`)}
              className="w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm group animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Line dot */}
              <div className="relative flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
                {i < filtered.length - 1 && (
                  <div className="w-0.5 h-6 bg-accent/30 absolute top-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground truncate">
                  {station.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tenantCount} tenant{tenantCount !== 1 ? "s" : ""}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Stasiun tidak ditemukan
        </div>
      )}
    </div>
  );
};

export default StationSelect;
