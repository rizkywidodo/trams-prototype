import { useState } from "react";
import { Check, Pen } from "lucide-react";

const SignatureCard = ({ 
  label, 
  savedName, 
  onSign 
}: { 
  label: string;
  savedName: string;
  onSign: (name: string) => void;
}) => {
  const [name, setName] = useState(savedName);
  const locked = !!savedName;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center space-y-2.5">
      <p className="text-xs font-bold text-foreground">{label}</p>
      {!locked ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama..."
            className="w-full text-center rounded-md border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => { if (name.trim()) onSign(name.trim()); }}
            disabled={!name.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pen className="h-3 w-3" />
            Tanda Tangan
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <div className="border-b-2 border-foreground pb-1 mx-2">
            <p className="text-sm font-bold text-foreground italic">{savedName}</p>
          </div>
          <div className="flex items-center justify-center gap-1 text-success">
            <Check className="h-3 w-3" />
            <p className="text-[10px] font-semibold">Ditandatangani</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureCard;