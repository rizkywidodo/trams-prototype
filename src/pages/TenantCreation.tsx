import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Maximize2, Grid3X3, CalendarDays, Phone, Mail, Upload, X, Image, FileText, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATIONS } from "@/data/stations";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-[hsl(var(--success))]" },
  { value: "inactive", label: "Inactive", color: "bg-muted-foreground" },
  { value: "renovation", label: "Renovation", color: "bg-[hsl(var(--warning))]" },
];

const KATEGORI_OPTIONS = ["F&B", "Retail", "Service", "ATM", "Vending Machine", "Others"];

interface FileUpload {
  file: File;
  preview: string;
}

const DropZone = ({
  label,
  accept,
  hint,
  icon: Icon,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  accept: string;
  hint: string;
  icon: React.ElementType;
  files: FileUpload[];
  onAdd: (f: FileUpload[]) => void;
  onRemove: (i: number) => void;
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    onAdd(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    onAdd(selected);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-primary/25 rounded-xl bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary/40 transition-all p-6 text-center cursor-pointer group"
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 mx-auto text-primary/40 group-hover:text-primary/60 transition-colors mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Drop files here or <span className="text-primary font-semibold">browse</span>
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((f, i) => (
            <div key={i} className="relative group/file">
              {f.preview ? (
                <img src={f.preview} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TenantCreation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedStation = searchParams.get("station") || "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [station, setStation] = useState(preselectedStation);
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggalBuka, setTanggalBuka] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [photos, setPhotos] = useState<FileUpload[]>([]);
  const [documents, setDocuments] = useState<FileUpload[]>([]);
  const [petaFiles, setPetaFiles] = useState<FileUpload[]>([]);
  const [denahFiles, setDenahFiles] = useState<FileUpload[]>([]);

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === status);

  const handleSubmit = () => {
    if (!name.trim() || !station) {
      toast.error("Nama Tenant dan Stasiun wajib diisi");
      return;
    }
    toast.success("Tenant berhasil dibuat!", { description: `${name} telah ditambahkan ke sistem.` });
    navigate("/master-data/tenants");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/master-data/tenants")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-medium">Kembali ke Daftar Tenant</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-card-foreground">Tenant Creation</h2>
        <p className="text-sm text-muted-foreground mt-1">Tambahkan tenant baru ke dalam sistem TRAMS</p>
      </div>

      {/* Top card: Identity */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-[hsl(var(--accent))] to-primary" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar upload */}
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
                {photos.length > 0 && photos[0].preview ? (
                  <img src={photos[0].preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-primary/40" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Upload className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${s.color}`} />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusInfo && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-card-foreground">Nama Tenant</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama tenant" className="mt-1.5" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-card-foreground">Deskripsi</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat tenant..." className="mt-1.5 min-h-[70px]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info + Upload row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Informasi Tenant */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-primary" />
              </div>
              Informasi Tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Station */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Stasiun</label>
                <Select value={station} onValueChange={setStation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih stasiun" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location in station */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Lokasi dalam Stasiun</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Lantai 1 Area Komersial" className="mt-1" />
              </div>
            </div>

            {/* Area */}
            <div className="flex items-start gap-3">
              <Maximize2 className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Luas Area</label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Contoh: 25 m²" className="mt-1" />
              </div>
            </div>

            {/* Kategori */}
            <div className="flex items-start gap-3">
              <Grid3X3 className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Kategori</label>
                <Select value={kategori} onValueChange={setKategori}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">Tanggal Buka</label>
                  <Input type="date" value={tanggalBuka} onChange={(e) => setTanggalBuka(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-[hsl(var(--warning))] mt-2 shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">Lease End</label>
                  <Input type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-2 shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">Telepon PJ</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" className="mt-1" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-2 shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">Email PJ</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5">
              <DropZone
                label="Foto Tenant"
                accept="image/*"
                hint="JPEG, PNG — maks 50MB"
                icon={Image}
                files={photos}
                onAdd={(f) => setPhotos((prev) => [...prev, ...f])}
                onRemove={(i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <DropZone
                label="Dokumen"
                accept=".pdf,.doc,.docx"
                hint="PDF, DOCX — maks 50MB"
                icon={FileText}
                files={documents}
                onAdd={(f) => setDocuments((prev) => [...prev, ...f])}
                onRemove={(i) => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Peta & Denah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-5">
            <DropZone
              label="Peta Tenant"
              accept="image/*"
              hint="JPEG, PNG — maks 50MB"
              icon={Map}
              files={petaFiles}
              onAdd={(f) => setPetaFiles((prev) => [...prev, ...f])}
              onRemove={(i) => setPetaFiles((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <DropZone
              label="Denah Tenant"
              accept="image/*"
              hint="JPEG, PNG — maks 50MB"
              icon={Map}
              files={denahFiles}
              onAdd={(f) => setDenahFiles((prev) => [...prev, ...f])}
              onRemove={(i) => setDenahFiles((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate("/master-data/tenants")}
          className="px-6 py-2.5 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          Simpan Tenant
        </button>
      </div>
    </div>
  );
};

export default TenantCreation;
