import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Store, MapPin, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TENANTS, STATIONS } from "@/data/stations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TenantList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stationFilter, setStationFilter] = useState("all");

  const filtered = TENANTS.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStation = stationFilter === "all" || t.stationId === stationFilter;
    return matchSearch && matchStation;
  });

  const getStation = (id: string) => STATIONS.find((s) => s.id === id);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Daftar Tenant</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {TENANTS.length} tenant terdaftar di seluruh stasiun
          </p>
        </div>
        <button
          onClick={() => navigate("/master-data/tenants/create")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tambah Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tenant..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Semua Stasiun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Stasiun</SelectItem>
              {STATIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tenant) => {
          const station = getStation(tenant.stationId);
          return (
            <Card
              key={tenant.id}
              className="group hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
              onClick={() => navigate(`/master-data/tenants/${tenant.id}`)}
            >
              <div className="h-1 bg-gradient-to-r from-primary to-[hsl(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-card-foreground truncate">{tenant.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                      <span className="text-xs text-muted-foreground truncate">{station?.name || "-"}</span>
                    </div>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add card */}
        <Card
          className="border-dashed border-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer"
          onClick={() => navigate("/master-data/tenants/create")}
        >
          <CardContent className="p-5 flex items-center justify-center min-h-[120px]">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto text-primary/30 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Tambah Tenant Baru</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantList;
