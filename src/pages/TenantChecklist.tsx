import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { STATIONS, TENANTS, CHECKLIST_ITEMS } from "@/data/stations";
import { ArrowLeft, ClipboardCheck, Check, X, MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";

type CheckState = Record<string, Record<string, boolean | null>>;
type NotesState = Record<string, string>;

const TenantChecklist = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();

  const station = STATIONS.find((s) => s.id === stationId);
  const tenants = useMemo(
    () => TENANTS.filter((t) => t.stationId === stationId),
    [stationId]
  );

  const [checks, setChecks] = useState<CheckState>(() => {
    const init: CheckState = {};
    tenants.forEach((t) => {
      init[t.id] = {};
      CHECKLIST_ITEMS.forEach((item) => {
        init[t.id][item.key] = null;
      });
    });
    return init;
  });

  const [notes, setNotes] = useState<NotesState>(() => {
    const init: NotesState = {};
    tenants.forEach((t) => {
      init[t.id] = "";
    });
    return init;
  });

  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Stasiun tidak ditemukan</p>
      </div>
    );
  }

  const toggleCheck = (tenantId: string, key: string, value: boolean) => {
    setChecks((prev) => ({
      ...prev,
      [tenantId]: {
        ...prev[tenantId],
        [key]: prev[tenantId][key] === value ? null : value,
      },
    }));
  };

  const getProgress = () => {
    let total = 0;
    let filled = 0;
    tenants.forEach((t) => {
      CHECKLIST_ITEMS.forEach((item) => {
        total++;
        if (checks[t.id]?.[item.key] !== null) filled++;
      });
    });
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  };

  const handleSave = () => {
    toast.success("Checklist berhasil disimpan!", {
      description: `${station.name} — ${new Date().toLocaleDateString("id-ID")}`,
    });
  };

  const progress = getProgress();

  return (
    <div className="p-6">
      {/* Sub header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base text-card-foreground truncate">{station.name}</h2>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">{progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-6 max-w-3xl">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4 max-w-3xl">
        {tenants.map((tenant, idx) => (
          <div
            key={tenant.id}
            className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Tenant header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <h2 className="font-semibold text-sm text-card-foreground">
                {tenant.name}
              </h2>
              <span className="text-xs text-muted-foreground">
                {Object.values(checks[tenant.id] || {}).filter((v) => v !== null).length}/
                {CHECKLIST_ITEMS.length}
              </span>
            </div>

            {/* Checklist */}
            <div className="divide-y divide-border">
              {CHECKLIST_ITEMS.map((item) => {
                const val = checks[tenant.id]?.[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-card-foreground pr-4">
                      {item.label}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleCheck(tenant.id, item.key, true)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          val === true
                            ? "bg-success text-success-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-success/10 hover:text-success"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Yes
                      </button>
                      <button
                        onClick={() => toggleCheck(tenant.id, item.key, false)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          val === false
                            ? "bg-destructive text-destructive-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        }`}
                      >
                        <X className="h-3.5 w-3.5" />
                        No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes toggle */}
            <div className="border-t border-border">
              <button
                onClick={() =>
                  setOpenNotes((prev) => ({
                    ...prev,
                    [tenant.id]: !prev[tenant.id],
                  }))
                }
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-card-foreground transition-colors w-full"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {openNotes[tenant.id] ? "Sembunyikan" : "Tambah"} Catatan
              </button>
              {openNotes[tenant.id] && (
                <div className="px-4 pb-3">
                  <textarea
                    value={notes[tenant.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [tenant.id]: e.target.value,
                      }))
                    }
                    placeholder="Tulis catatan di sini..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {tenants.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Belum ada tenant di stasiun ini
          </div>
        )}

        {/* Save button */}
        {tenants.length > 0 && (
          <div className="pt-4 pb-8">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Save className="h-4 w-4" />
              Simpan Checklist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantChecklist;
