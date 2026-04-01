import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Tag, Calendar, Phone, Mail, Store, Edit, Download, Globe, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TENANTS, STATIONS } from "@/data/stations";

const TenantDetail = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const tenant = TENANTS.find((t) => t.id === tenantId);
  const station = tenant ? STATIONS.find((s) => s.id === tenant.stationId) : null;

  if (!tenant) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Tenant tidak ditemukan.</p>
        <button onClick={() => navigate("/master-data/tenants")} className="mt-4 text-primary underline text-sm">
          Kembali ke daftar
        </button>
      </div>
    );
  }

  // Mock detail data
  const detail = {
    description: "Minimarket terkemuka yang menyediakan berbagai kebutuhan sehari-hari bagi penumpang MRT.",
    lokasi: "A1",
    luas: "15 m²",
    kategori: "Retail",
    tanggalBuka: "15/01/2024",
    leaseEnd: "15/01/2026",
    telepon: "+62 812 3456 7890",
    email: "contact@tenant.mail.com",
  };

  const documents = [
    { name: "Kontrak_Sewa.pdf", size: "200 KB", date: "15 Jan 2024" },
    { name: "Izin_Usaha.pdf", size: "150 KB", date: "10 Jan 2024" },
  ];

  const mapDocuments = [
    { name: `Peta_${tenant.name.replace(/\s+/g, "_")}.png`, size: "300 KB", date: "15 Jan 2024" },
    { name: `Denah_${tenant.name.replace(/\s+/g, "_")}.png`, size: "250 KB", date: "15 Jan 2024" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/master-data/tenants")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-card-foreground">{tenant.name}</h1>
                <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0 text-xs">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{station?.name} Station</p>
              <p className="text-sm text-muted-foreground mt-0.5">{detail.description}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </CardContent>
      </Card>

      {/* Info + Foto grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Informasi Tenant */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-card-foreground mb-5">Informasi Tenant</h2>
            <div className="space-y-4">
              <InfoRow icon={MapPin} label="Stasiun" value={station?.name || "-"} />
              <InfoRow icon={MapPin} label="Lokasi dalam Stasiun" value={detail.lokasi} />
              <InfoRow icon={Ruler} label="Luas Area" value={detail.luas} />
              <InfoRow icon={Globe} label="Kategori" value={detail.kategori} />
              <InfoRow icon={Calendar} label="Tanggal Buka" value={detail.tanggalBuka} />
              <InfoRow icon={Calendar} label="Lease End" value={detail.leaseEnd} />
              <InfoRow icon={Phone} label="Telepon PJ" value={detail.telepon} />
              <InfoRow icon={Mail} label="Email PJ" value={detail.email} />
            </div>
          </CardContent>
        </Card>

        {/* Foto & Dokumen */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-card-foreground mb-5">Foto & Dokumen</h2>
            {/* Photo placeholder grid */}
            <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
              <Store className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                  <Store className="h-4 w-4 text-muted-foreground/30" />
                </div>
              ))}
            </div>
            {/* Documents */}
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-5">Map</h2>
          <div className="bg-muted rounded-lg p-6">
            {/* Station map mockup */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-full border overflow-hidden">
                <button className="px-5 py-2 text-sm font-medium bg-foreground text-background">Stasiun</button>
                <button className="px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Denah</button>
              </div>
            </div>
            <div className="max-w-lg mx-auto">
              {/* Top row */}
              <div className="flex gap-2 mb-1">
                <div className="flex-1 h-14 rounded bg-foreground text-background flex items-center justify-center text-xs font-bold">A1</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">A2</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">A3</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">Toilet</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground text-center leading-tight">Kantor<br />Stasiun</div>
              </div>
              <p className="text-center text-xs text-muted-foreground my-3">— Platform —</p>
              {/* Bottom row */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">B1</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">B2</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">B3</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">B4</div>
                <div className="flex-1 h-14 rounded border flex items-center justify-center text-xs text-muted-foreground">Musholla</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="px-4 py-1.5 border rounded text-xs text-muted-foreground">Pintu Masuk</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-3 w-3 bg-foreground rounded-sm" />
                  Lokasi Tenant
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peta & Denah Tenant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mapDocuments.map((doc) => (
          <Card key={doc.name}>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-card-foreground mb-4">
                {doc.name.startsWith("Peta") ? "Peta Tenant" : "Denah Tenant"}
              </h2>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
                </div>
                <Download className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="border-b border-border pb-3 last:border-0 last:pb-0">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-card-foreground">{value}</span>
    </div>
  </div>
);

export default TenantDetail;
