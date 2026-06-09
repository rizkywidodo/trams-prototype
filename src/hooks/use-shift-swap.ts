export interface SwapRequest {
  id: string;
  requestorNik: string;
  requestorName: string;
  requestorDate: string;
  requestorShift: string;
  targetNik: string;
  targetName: string;
  targetDate: string;
  targetShift: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

const STORAGE_KEY = "shift-swap-requests";

export const useShiftSwap = () => {
  const getAll = (): SwapRequest[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const addRequest = (req: Omit<SwapRequest, "id" | "createdAt" | "status">) => {
    const all = getAll();
    const newReq: SwapRequest = {
      ...req,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...all, newReq]));
    return newReq;
  };

  const updateStatus = (id: string, status: "approved" | "rejected", reviewNote?: string) => {
    const all = getAll();
    const updated = all.map((r) =>
      r.id === id ? { ...r, status, reviewedAt: new Date().toISOString(), reviewNote } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getPendingCount = () => getAll().filter((r) => r.status === "pending").length;

  return { getAll, addRequest, updateStatus, getPendingCount };
};