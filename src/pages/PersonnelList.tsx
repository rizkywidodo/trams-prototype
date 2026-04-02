import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PersonnelCategory = "organik" | "frontliner" | "facility-care" | "p3k" | "security";

interface Personnel {
  id: string;
  name: string;
  nik: string;
  station: string;
  jabatan: string;
  shift: "Pagi" | "Siang" | "Malam";
  status: "Aktif" | "Cuti" | "Non-aktif";
  category: PersonnelCategory;
}

const PERSONNEL_DATA: Personnel[] = [
  // Organik
  { id: "1", name: "Teguh Prabowo", nik: "MRT-2023-00031", station: "Dukuh Atas BNI", jabatan: "Station Manager", shift: "Pagi", status: "Aktif", category: "organik" },
  { id: "2", name: "Hendra Kusuma", nik: "MRT-2023-00015", station: "Bundaran HI", jabatan: "Station Duty Section Head", shift: "Pagi", status: "Aktif", category: "organik" },
  { id: "3", name: "Ahmad Fauzan", nik: "MRT-2024-00142", station: "Dukuh Atas BNI", jabatan: "Station Officer", shift: "Siang", status: "Aktif", category: "organik" },
  { id: "4", name: "Rina Wulandari", nik: "MRT-2023-00078", station: "Lebak Bulus Grab", jabatan: "Planner", shift: "Pagi", status: "Aktif", category: "organik" },
  { id: "5", name: "Bambang Setiawan", nik: "MRT-2024-00201", station: "Blok M BCA", jabatan: "Assistant Planner", shift: "Pagi", status: "Aktif", category: "organik" },
  { id: "6", name: "Siti Nurhaliza", nik: "MRT-2023-00055", station: "Senayan", jabatan: "Head", shift: "Pagi", status: "Cuti", category: "organik" },
  // Frontliner
  { id: "7", name: "Dian Pratama", nik: "MRT-2024-00310", station: "Dukuh Atas BNI", jabatan: "JS Leader", shift: "Pagi", status: "Aktif", category: "frontliner" },
  { id: "8", name: "Fajar Hidayat", nik: "MRT-2024-00311", station: "Bundaran HI", jabatan: "Junior Staff", shift: "Siang", status: "Aktif", category: "frontliner" },
  { id: "9", name: "Lestari Dewi", nik: "MRT-2024-00312", station: "Lebak Bulus Grab", jabatan: "Junior Staff", shift: "Pagi", status: "Aktif", category: "frontliner" },
  { id: "10", name: "Rudi Hermawan", nik: "MRT-2024-00313", station: "Blok M BCA", jabatan: "JS Leader", shift: "Malam", status: "Aktif", category: "frontliner" },
  { id: "11", name: "Yuni Astuti", nik: "MRT-2024-00314", station: "Senayan", jabatan: "Junior Staff", shift: "Siang", status: "Non-aktif", category: "frontliner" },
  // Facility Care
  { id: "12", name: "Andi Saputra", nik: "MRT-2023-00401", station: "Dukuh Atas BNI", jabatan: "Facility Care Staff", shift: "Pagi", status: "Aktif", category: "facility-care" },
  { id: "13", name: "Budi Santoso", nik: "MRT-2023-00402", station: "Bundaran HI", jabatan: "Facility Care Lead", shift: "Siang", status: "Aktif", category: "facility-care" },
  { id: "14", name: "Citra Melati", nik: "MRT-2024-00403", station: "Lebak Bulus Grab", jabatan: "Facility Care Staff", shift: "Malam", status: "Aktif", category: "facility-care" },
  // P3K
  { id: "15", name: "Dr. Putri Ayu", nik: "MRT-2023-00501", station: "Dukuh Atas BNI", jabatan: "Paramedis", shift: "Pagi", status: "Aktif", category: "p3k" },
  { id: "16", name: "Wahyu Pratama", nik: "MRT-2024-00502", station: "Lebak Bulus Grab", jabatan: "Paramedis", shift: "Siang", status: "Aktif", category: "p3k" },
  // Security
  { id: "17", name: "Agus Kurniawan", nik: "MRT-2023-00601", station: "Dukuh Atas BNI", jabatan: "Kepala Satpam", shift: "Pagi", status: "Aktif", category: "security" },
  { id: "18", name: "Joko Widodo", nik: "MRT-2023-00602", station: "Bundaran HI", jabatan: "Satpam", shift: "Malam", status: "Aktif", category: "security" },
  { id: "19", name: "Surya Darma", nik: "MRT-2024-00603", station: "Blok M BCA", jabatan: "Satpam", shift: "Siang", status: "Aktif", category: "security" },
  { id: "20", name: "Irfan Maulana", nik: "MRT-2024-00604", station: "Senayan", jabatan: "Satpam", shift: "Pagi", status: "Cuti", category: "security" },
];

const TABS: { value: PersonnelCategory; label: string }[] = [
  { value: "organik", label: "Organik" },
  { value: "frontliner", label: "Frontliner" },
  { value: "facility-care", label: "Facility Care" },
  { value: "p3k", label: "P3K" },
  { value: "security", label: "Security" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Aktif": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Cuti": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Non-aktif": return "bg-red-100 text-red-700 border-red-200";
    default: return "";
  }
};

const shiftColor = (shift: string) => {
  switch (shift) {
    case "Pagi": return "bg-sky-100 text-sky-700 border-sky-200";
    case "Siang": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Malam": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default: return "";
  }
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const PersonnelList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as PersonnelCategory) || "organik";
  const [search, setSearch] = useState("");

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSearch("");
  };

  const filtered = useMemo(() => {
    return PERSONNEL_DATA.filter((p) => {
      if (p.category !== activeTab) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.nik.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.station.toLowerCase().includes(q)
      );
    });
  }, [activeTab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    TABS.forEach((t) => {
      c[t.value] = PERSONNEL_DATA.filter((p) => p.category === t.value).length;
    });
    return c;
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personil</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola data personil MRT Jakarta</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Personil
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              {tab.label}
              <span className="ml-1 text-xs opacity-70">{counts[tab.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search */}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table content for each tab */}
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[250px]">Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Stasiun</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data personil ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">{getInitials(p.name)}</span>
                            </div>
                            <span className="font-medium text-foreground">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{p.nik}</TableCell>
                        <TableCell className="text-foreground">{p.station}</TableCell>
                        <TableCell>
                          <span className="text-primary font-medium">{p.jabatan}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={shiftColor(p.shift)}>{p.shift}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-foreground font-medium">
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PersonnelList;
