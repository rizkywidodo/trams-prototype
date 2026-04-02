import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PERSONNEL_DATA, CATEGORY_LABELS, type PersonnelCategory } from "@/data/personnel";

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
    case "Office Hour": return "bg-teal-100 text-teal-700 border-teal-200";
    default: return "";
  }
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const PersonnelList = () => {
  const navigate = useNavigate();
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

        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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
                      <TableRow key={p.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => navigate(`/master-data/personnel/${p.id}`)}>
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
