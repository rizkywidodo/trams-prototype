import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Building2, Briefcase, Clock, CalendarDays, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PERSONNEL_DATA, CATEGORY_LABELS } from "@/data/personnel";

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

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const PersonnelDetail = () => {
  const { personnelId } = useParams();
  const navigate = useNavigate();

  const person = PERSONNEL_DATA.find((p) => p.id === personnelId);

  if (!person) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-muted-foreground">Data personil tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(`/master-data/personnel?tab=${person.category}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Personil
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">{getInitials(person.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{person.name}</h1>
                <Badge variant="outline" className={statusColor(person.status)}>{person.status}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{person.jabatan}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border font-mono text-xs">
                  {person.nik}
                </Badge>
                <Badge variant="outline" className={shiftColor(person.shift)}>
                  {person.shift}
                </Badge>
                <Badge variant="secondary">
                  {CATEGORY_LABELS[person.category]}
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="shrink-0">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Kerja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Building2} label="Stasiun" value={person.station} />
            <Separator />
            <InfoItem icon={Briefcase} label="Jabatan" value={person.jabatan} />
            <Separator />
            <InfoItem icon={Clock} label="Shift" value={person.shift} />
            <Separator />
            <InfoItem icon={Shield} label="Kategori" value={CATEGORY_LABELS[person.category]} />
            <Separator />
            <InfoItem icon={CalendarDays} label="Tanggal Bergabung" value={person.joinDate ? new Date(person.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Phone} label="Telepon" value={person.phone || "-"} />
            <Separator />
            <InfoItem icon={Mail} label="Email" value={person.email || "-"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonnelDetail;
