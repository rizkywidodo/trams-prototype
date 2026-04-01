import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Train, Users, Store, Upload, X, FileText, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TENANTS } from "@/data/stations";
import { toast } from "sonner";

interface FileUpload {
  file: File;
  preview: string;
}

const PERSONNEL_MOCK = [
  { id: "p1", name: "Ahmad Fauzi", role: "Station Manager" },
  { id: "p2", name: "Budi Santoso", role: "Security Officer" },
  { id: "p3", name: "Citra Dewi", role: "Customer Service" },
  { id: "p4", name: "Dian Purnama", role: "Technician" },
  { id: "p5", name: "Eko Prasetyo", role: "Cleaning Staff Lead" },
  { id: "p6", name: "Fitri Handayani", role: "Admin Officer" },
  { id: "p7", name: "Gunawan Wibowo", role: "Security Officer" },
  { id: "p8", name: "Hendra Kurniawan", role: "Technician" },
];

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

const StationCreation = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [stationType, setStationType] = useState("");
  const [region, setRegion] = useState("");

  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [floormapFiles, setFloormapFiles] = useState<FileUpload[]>([]);

  const togglePersonnel = (id: string) => {
    setSelectedPersonnel((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleTenant = (id: string) => {
    setSelectedTenants((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || !stationType || !region) {
      toast.error("Nama, Tipe Stasiun, dan Region wajib diisi");
      return;
    }
    toast.success("Stasiun berhasil dibuat!", { description: `${name} telah ditambahkan ke sistem.` });
    navigate("/master-data/stations");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/master-data/stations")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-medium">Kembali ke Daftar Stasiun</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-card-foreground">Station Creation</h2>
        <p className="text-sm text-muted-foreground mt-1">Tambahkan stasiun baru ke dalam sistem TRAMS</p>
      </div>

      {/* Identity card */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-[hsl(var(--accent))] to-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Train className="h-4 w-4 text-primary" />
            </div>
            Informasi Stasiun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="flex items-start gap-3">
            <Train className="h-5 w-5 text-primary mt-2 shrink-0" />
            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground">Nama Stasiun *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama stasiun" className="mt-1" />
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground">Alamat</label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Masukkan alamat stasiun" className="mt-1 min-h-[70px]" />
            </div>
          </div>

          {/* Type & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Train className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Tipe Stasiun *</label>
                <Select value={stationType} onValueChange={setStationType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih tipe stasiun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="underground">Underground</SelectItem>
                    <SelectItem value="khusus">Khusus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[hsl(var(--accent))] mt-2 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">Region *</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Region 1</SelectItem>
                    <SelectItem value="2">Region 2</SelectItem>
                    <SelectItem value="3">Region 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnel & Tenant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personnel */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Personel Stasiun
              {selectedPersonnel.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">{selectedPersonnel.length} dipilih</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pilih personel yang bertugas di stasiun ini</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {PERSONNEL_MOCK.map((p) => {
                const selected = selectedPersonnel.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePersonnel(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                      selected
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "border border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm truncate ${selected ? "text-primary" : "text-card-foreground"}`}>{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
                    {selected && (
                      <div className="h-5 w-5 rounded-full bg-[hsl(var(--success))] flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-[hsl(var(--success-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tenants */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
              Tenant Stasiun
              {selectedTenants.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">{selectedTenants.length} dipilih</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pilih tenant yang ada di stasiun ini</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {TENANTS.map((t) => {
                const selected = selectedTenants.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTenant(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                      selected
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "border border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Store className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm truncate ${selected ? "text-primary" : "text-card-foreground"}`}>{t.name}</p>
                    </div>
                    {selected && (
                      <div className="h-5 w-5 rounded-full bg-[hsl(var(--success))] flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-[hsl(var(--success-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floormap Upload */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <DropZone
            label="Denah Stasiun (Floormap)"
            accept="image/*,.pdf"
            hint="JPEG, PNG, PDF — maks 50MB"
            icon={Map}
            files={floormapFiles}
            onAdd={(f) => setFloormapFiles((prev) => [...prev, ...f])}
            onRemove={(i) => setFloormapFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate("/master-data/stations")}
          className="px-6 py-2.5 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          Simpan Stasiun
        </button>
      </div>
    </div>
  );
};

export default StationCreation;
