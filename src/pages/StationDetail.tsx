import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Train, MapPin, Store, Users, Phone, Shield, Wrench, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATION_DATA } from "@/pages/StationList";
import { TENANTS } from "@/data/stations";

// Mock personnel data per station
const PERSONNEL_BY_STATION: Record<string, {
  stationManager: { name: string; shift: string; phone: string } | null;
  security: { name: string; role: string; shift: string; phone: string }[];
  facilityCare: { name: string; role: string; shift: string; phone: string }[];
  frontliner: { name: string; role: string; shift: string; phone: string }[];
}> = {};

const SECURITY_NAMES = ["Wahyu Setiawan", "Rizky Aditya", "Bambang Supriadi", "Andi Kurniawan", "Joko Prasetyo"];
const FACILITY_NAMES = ["Sari Dewi", "Rina Marlina", "Agus Hermawan", "Tono Wijaya", "Dedi Mulyadi"];
const FRONTLINER_NAMES = ["Mega Puspita", "Putri Rahayu", "Galih Permana", "Nita Sari", "Fajar Nugroho"];
const SM_NAMES = ["Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Purnama", "Eko Prasetyo", "Fitri Handayani"];
const SHIFTS = ["Pagi (06:00–14:00)", "Siang (14:00–22:00)", "Malam (22:00–06:00)"];

import { STATIONS } from "@/data/stations";
STATIONS.forEach((s, i) => {
  const secCount = 2 + (i % 3);
  const fcCount = 1 + (i % 2);
  const flCount = 2 + (i % 2);

  PERSONNEL_BY_STATION[s.id] = {
    stationManager: {
      name: SM_NAMES[i % SM_NAMES.length],
      shift: SHIFTS[0],
      phone: `0821-${String(2345 + i).padStart(4, "0")}-${String(6789 + i).padStart(4, "0")}`,
    },
    security: Array.from({ length: secCount }, (_, j) => ({
      name: SECURITY_NAMES[(i + j) % SECURITY_NAMES.length],
      role: "Security",
      shift: SHIFTS[j % SHIFTS.length],
      phone: `0823-${String(4567 + i + j).padStart(4, "0")}-${String(8901 + j).padStart(4, "0")}`,
    })),
    facilityCare: Array.from({ length: fcCount }, (_, j) => ({
      name: FACILITY_NAMES[(i + j) % FACILITY_NAMES.length],
      role: "Facility Care",
      shift: SHIFTS[j % SHIFTS.length],
      phone: `0856-${String(1234 + i + j).padStart(4, "0")}-${String(5678 + j).padStart(4, "0")}`,
    })),
    frontliner: Array.from({ length: flCount }, (_, j) => ({
      name: FRONTLINER_NAMES[(i + j) % FRONTLINER_NAMES.length],
      role: "Customer Service",
      shift: SHIFTS[j % SHIFTS.length],
      phone: `0824-${String(5678 + i + j).padStart(4, "0")}-${String(9012 + j).padStart(4, "0")}`,
    })),
  };
});

const PersonnelSection = ({
  title,
  icon: Icon,
  items,
  badgeColor,
}: {
  title: string;
  icon: React.ElementType;
  items: { name: string; role: string; shift: string; phone: string }[];
  badgeColor: string;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <Badge variant="outline" className="text-xs">{items.length}</Badge>
      </div>
      <div className="divide-y divide-border">
        {items.map((p, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm text-card-foreground">{p.name}</p>
              <Badge className={`text-[10px] font-bold ${badgeColor}`}>{p.role}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{p.shift}</span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {p.phone}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StationDetail = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();

  const station = STATION_DATA.find((s) => s.id === stationId);
  const personnel = stationId ? PERSONNEL_BY_STATION[stationId] : null;
  const tenants = TENANTS.filter((t) => t.stationId === stationId);

  if (!station) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Stasiun tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/master-data/stations")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors mb-4 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-medium">Kembali ke Daftar Stasiun</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Train className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">{station.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {station.address}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/master-data/stations/create`)}
          className="px-5 py-2 rounded-lg border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
        >
          Edit Stasiun
        </button>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Train className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">Jenis Stasiun</span>
            </div>
            <Badge variant="outline" className={`capitalize text-xs font-bold ${
              station.type === "underground" ? "border-primary/40 text-primary" :
              station.type === "khusus" ? "border-amber-400 text-amber-600" : ""
            }`}>
              {station.type}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-[hsl(var(--accent))]" />
              <span className="text-sm font-semibold text-card-foreground">Tipe Stasiun</span>
            </div>
            <Badge variant="outline" className="text-xs font-bold">
              {station.size}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">Total Tenant</span>
            </div>
            <p className="text-3xl font-bold text-card-foreground">{tenants.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant list & Personnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tenants */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Daftar Tenant
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{tenants.length}</Badge>
                <button className="text-xs font-semibold text-primary hover:underline">+ Tambah</button>
              </div>
            </div>
            {tenants.length > 0 ? (
              <div className="divide-y divide-border">
                {tenants.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm text-card-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Retail</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-bold">Aktif</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada tenant</p>
            )}
          </CardContent>
        </Card>

        {/* Station Manager */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Station Manager
              </h3>
            </div>
            {personnel?.stationManager && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-card-foreground">{personnel.stationManager.name}</p>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] font-bold">Station Manager</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{personnel.stationManager.shift}</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {personnel.stationManager.phone}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personnel sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {personnel && (
          <>
            <PersonnelSection
              title="Satpam"
              icon={Shield}
              items={personnel.security}
              badgeColor="bg-amber-50 text-amber-600 border-amber-200"
            />
            <PersonnelSection
              title="Facility Care"
              icon={Wrench}
              items={personnel.facilityCare}
              badgeColor="bg-emerald-50 text-emerald-600 border-emerald-200"
            />
            <PersonnelSection
              title="Frontliner"
              icon={Headphones}
              items={personnel.frontliner}
              badgeColor="bg-violet-50 text-violet-600 border-violet-200"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StationDetail;
