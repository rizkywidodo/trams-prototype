import { CheckCircle2, FileDown, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { STATIONS } from "@/data/stations";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PatrolSubmitted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get("station") || "";
  const station = STATIONS.find((s) => s.id === stationId);
  const now = new Date();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      {/* Header info */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-card-foreground">Form Station Patrol</span>
          <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium">
            {format(now, "MMM d, yyyy", { locale: id })}
          </span>
          <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium">
            {format(now, "hh:mm a")}
          </span>
        </div>
        {station && (
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-primary/10 border border-primary/20" />
            {station.name} Station
          </p>
        )}
      </div>

      {/* Success card */}
      <div className="relative w-full max-w-lg">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground leading-snug">
            Laporan Patroli berhasil terkirim.
          </h2>
          <p className="text-base md:text-lg font-semibold text-card-foreground mt-2">
            Silahkan lakukan refresh
          </p>
          <p className="text-base md:text-lg font-semibold text-card-foreground">
            pada halaman Daily Check
          </p>
        </div>
        {/* Triangle pointer */}
        <div className="flex justify-center -mt-px">
          <div className="w-6 h-6 bg-card border-b border-r border-border rotate-45 -translate-y-3 shadow-lg" />
        </div>
      </div>

      {/* Success icon */}
      <div className="my-6">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--success))] flex items-center justify-center shadow-md">
          <CheckCircle2 className="h-10 w-10 text-[hsl(var(--success-foreground))]" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/daily-check/tenant")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Daily Check
        </button>
        <button
          onClick={() => {
            // placeholder for download
            const blob = new Blob(
              [`Laporan Patrol - ${station?.name || "Unknown"}\nTanggal: ${format(now, "dd MMMM yyyy", { locale: id })}\nWaktu: ${format(now, "HH:mm")}\n\nStatus: Submitted`],
              { type: "text/plain" }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `patrol-${station?.name || "report"}-${format(now, "yyyyMMdd-HHmm")}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <FileDown className="h-4 w-4" />
          Unduh Patrol
        </button>
      </div>
    </div>
  );
};

export default PatrolSubmitted;
