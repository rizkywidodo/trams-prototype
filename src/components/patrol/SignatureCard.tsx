import { useState, useMemo } from "react";
import { Pen } from "lucide-react";

const SignatureCard = ({ label }: { label: string }) => {
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string>("");

  const barcodePattern = useMemo(() => {
    const seed = label + signedAt;
    const bars: number[] = [];
    for (let i = 0; i < 36; i++) {
      bars.push((seed.charCodeAt(i % seed.length) * (i + 1)) % 4 + 1);
    }
    return bars;
  }, [label, signedAt]);

  const handleSign = () => {
    const now = new Date().toISOString();
    setSignedAt(now);
    setSigned(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center space-y-2.5">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">Name</p>
      {!signed ? (
        <button
          onClick={handleSign}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Pen className="h-3 w-3" />
          Signed here
        </button>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-[1px] py-1">
            {barcodePattern.map((w, i) => (
              <div
                key={i}
                className="bg-foreground rounded-[0.5px]"
                style={{ width: `${w}px`, height: "32px" }}
              />
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground font-mono break-all">
            {btoa(label + "|" + signedAt).slice(0, 28)}
          </p>
          <button
            onClick={() => setSigned(false)}
            className="text-[10px] text-destructive hover:underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default SignatureCard;
