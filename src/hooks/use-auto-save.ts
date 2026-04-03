import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

const DEBOUNCE_MS = 1500;

export function useAutoSave<T>(key: string, data: T, setData: (val: T) => void) {
  const isInitial = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`draft:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: T; savedAt: string };
        setData(parsed.data);
        toast.info("Draft dipulihkan", {
          description: `Terakhir disimpan ${new Date(parsed.savedAt).toLocaleString("id-ID")}`,
        });
      }
    } catch {
      // ignore
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          `draft:${key}`,
          JSON.stringify({ data, savedAt: new Date().toISOString() })
        );
      } catch {
        // storage full
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [key, data]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft:${key}`);
  }, [key]);

  return { clearDraft };
}
