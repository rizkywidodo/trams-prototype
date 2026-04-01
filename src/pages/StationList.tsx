import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Train, MapPin, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { STATIONS } from "@/data/stations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATION_TYPES = [
  { value: "all", label: "Semua Tipe" },
  { value: "elevated", label: "Elevated" },
  { value: "underground", label: "Underground" },
];

const REGIONS = [
  { value: "all", label: "Semua Region" },
  { value: "1", label: "Region 1" },
  { value: "2", label: "Region 2" },
  { value: "3", label: "Region 3" },
];

const getStationType = (id: string, i: number): "elevated" | "underground" => {
  if (id === "dukuh-atas-bni" || id === "lebak-bulus") return "underground";
  const types: ("elevated" | "underground")[] = ["elevated", "underground"];
  return types[i % 2];
};

const getStationSize = (id: string, i: number): "Besar" | "Kecil" => {
  if (id === "dukuh-atas-bni" || id === "lebak-bulus") return "Besar";
  return i % 2 === 0 ? "Besar" : "Kecil";
};

const STATION_DATA = STATIONS.map((s, i) => ({
  ...s,
  type: getStationType(s.id, i),
  size: getStationSize(s.id, i),
  region: String((i % 3) + 1),
  address: `Jl. ${s.name}, Jakarta ${i % 2 === 0 ? "Selatan" : "Pusat"}`,
  personnelCount: Math.floor(Math.random() * 20) + 5,
  tenantCount: Math.floor(Math.random() * 8) + 1,
}));

export { STATION_DATA };

const StationList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const filtered = STATION_DATA.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || s.type === typeFilter;
    const matchRegion = regionFilter === "all" || s.region === regionFilter;
    return matchSearch && matchType && matchRegion;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Daftar Stasiun</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {STATION_DATA.length} stasiun terdaftar dalam sistem
          </p>
        </div>
        <button
          onClick={() => navigate("/master-data/stations/create")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tambah Stasiun
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari stasiun..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              {STATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Semua Region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((station) => (
          <Card
            key={station.id}
            className="group hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
            onClick={() => navigate(`/master-data/stations/${station.id}`)}
          >
            <div className="h-1 bg-gradient-to-r from-primary to-[hsl(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Train className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-card-foreground truncate">{station.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                    <span className="text-xs text-muted-foreground truncate">{station.address}</span>
                  </div>
                   <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                     <Badge variant="outline" className={`text-[10px] font-bold capitalize ${
                       station.type === "underground" ? "border-primary/40 text-primary" :
                       station.type === "khusus" ? "border-amber-400 text-amber-600" : ""
                     }`}>
                       {station.type}
                     </Badge>
                     <Badge variant="secondary" className="text-[10px] font-bold">
                       Region {station.region}
                     </Badge>
                   </div>
                  <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                    <span>{station.personnelCount} personel</span>
                    <span>•</span>
                    <span>{station.tenantCount} tenant</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add card */}
        <Card
          className="border-dashed border-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer"
          onClick={() => navigate("/master-data/stations/create")}
        >
          <CardContent className="p-5 flex items-center justify-center min-h-[160px]">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto text-primary/30 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Tambah Stasiun Baru</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StationList;
