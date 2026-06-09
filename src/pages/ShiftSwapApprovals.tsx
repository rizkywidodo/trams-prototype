import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { useShiftSwap, SwapRequest } from "@/hooks/use-shift-swap";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ShiftSwapApprovals = () => {
  const navigate = useNavigate();
  const { getAll, updateStatus } = useShiftSwap();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [reviewModal, setReviewModal] = useState<SwapRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    setRequests(getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleReview = (status: "approved" | "rejected") => {
    if (!reviewModal) return;
    updateStatus(reviewModal.id, status, reviewNote);
    setRequests(getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    toast.success(status === "approved" ? "Request disetujui!" : "Request ditolak", {
      description: reviewNote || undefined,
    });
    setReviewModal(null);
    setReviewNote("");
  };

  const statusBadge = (status: SwapRequest["status"]) => {
    if (status === "pending") return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3" />Menunggu</span>;
    if (status === "approved") return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success"><CheckCircle2 className="h-3 w-3" />Disetujui</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive"><XCircle className="h-3 w-3" />Ditolak</span>;
  };

  return (
    <div className="p-6 max-w-4xl">
      <button
        onClick={() => navigate("/scheduling")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Scheduling
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Approval Tukar Jadwal</h2>
          <p className="text-sm text-muted-foreground mt-1">Review dan setujui permintaan tukar shift</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold">
            {pendingCount} menunggu approval
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "pending" ? "Menunggu" : f === "all" ? "Semua" : f === "approved" ? "Disetujui" : "Ditolak"}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500 text-white text-[9px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada request {filter === "pending" ? "yang menunggu approval" : ""}
          </div>
        )}
        {filtered.map((req) => (
          <div key={req.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Requestor info */}
                <div className="flex items-center gap-2 mb-3">
                  {statusBadge(req.status)}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(req.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </span>
                </div>

                {/* Swap details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Pemohon</p>
                    <p className="text-sm font-bold text-foreground">{req.requestorName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(req.requestorDate), "EEEE, dd MMM yyyy", { locale: localeId })}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold">
                      {req.requestorShift}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Ditukar Dengan</p>
                    <p className="text-sm font-bold text-foreground">{req.targetName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(req.targetDate), "EEEE, dd MMM yyyy", { locale: localeId })}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold">
                      {req.targetShift}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                {req.reason && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {req.reason}
                  </div>
                )}

                {/* Review note */}
                {req.reviewNote && (
                  <div className="mt-2 flex items-start gap-2 text-xs bg-muted/30 rounded-lg px-3 py-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                    <span><span className="font-semibold text-foreground">Catatan reviewer: </span>{req.reviewNote}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {req.status === "pending" && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => { setReviewModal(req); setReviewNote(""); }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Permintaan Tukar Jadwal</DialogTitle>
          </DialogHeader>
          {reviewModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Pemohon</p>
                  <p className="text-sm font-bold">{reviewModal.requestorName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(reviewModal.requestorDate), "dd MMM", { locale: localeId })}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold">{reviewModal.requestorShift}</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Ditukar Dengan</p>
                  <p className="text-sm font-bold">{reviewModal.targetName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(reviewModal.targetDate), "dd MMM", { locale: localeId })}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold">{reviewModal.targetShift}</span>
                </div>
              </div>
              {reviewModal.reason && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <span className="font-semibold text-foreground">Alasan: </span>{reviewModal.reason}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">Catatan (opsional)</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk pemohon..."
                  className="w-full mt-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview("approved")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Check className="h-4 w-4" />
                  Setujui
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <X className="h-4 w-4" />
                  Tolak
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftSwapApprovals;