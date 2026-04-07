import { Check, ChevronDown, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { PATROL_CATEGORIES, ALL_ITEMS } from "@/data/patrol";
import { cn } from "@/lib/utils";

interface ShiftChecklistProps {
  shiftId: string;
  checks: Record<string, boolean>;
  toggleCheck: (itemId: string) => void;
  toggleCategory: (catId: string) => void;
}

const ShiftChecklist = ({ shiftId, checks, toggleCheck, toggleCategory }: ShiftChecklistProps) => {
  let idx = 0;
  const checkedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="text-[11px] text-muted-foreground">
          {checkedCount} / {ALL_ITEMS.length} item selesai
        </span>
        <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${ALL_ITEMS.length > 0 ? (checkedCount / ALL_ITEMS.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {PATROL_CATEGORIES.map((cat) => {
        const allChecked = cat.items.length > 0 && cat.items.every((item) => checks[item.id]);
        const someChecked = cat.items.some((item) => checks[item.id]);

        return (
          <Collapsible key={cat.id} defaultOpen className="mb-3">
            <div className={cn(
              "px-3 py-2 rounded-lg mb-1 flex items-center justify-between transition-colors duration-300",
              allChecked
                ? "bg-green-500/15 border border-green-500/30"
                : someChecked
                  ? "bg-yellow-500/15 border border-yellow-500/30"
                  : "bg-secondary/50"
            )}>
              <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:rotate-[-90deg] [[data-state=open]_&]:rotate-0" />
                <div className="flex items-center gap-2">
                  {!allChecked && someChecked && (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                  {allChecked && (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                  <span className={cn(
                    "text-[11px] font-bold tracking-wide",
                    allChecked ? "text-green-600 dark:text-green-400" : "text-foreground"
                  )}>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">({cat.items.filter(i => checks[i.id]).length}/{cat.items.length})</span>
                </div>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Semua</span>
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="h-5 w-5 rounded border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
              </div>
            </div>

            <CollapsibleContent>
              <div className="divide-y divide-border/40">
                {cat.items.map((item) => {
                  idx++;
                  const checked = checks[item.id] || false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors rounded-md",
                        checked ? "bg-accent/5" : "hover:bg-muted/40"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-6 w-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200",
                          checked
                            ? "bg-accent border-accent text-accent-foreground shadow-sm"
                            : "border-border/60 bg-background"
                        )}
                      >
                        {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">{idx}.</span>
                          <p className="text-xs font-semibold leading-snug text-foreground">
                            {item.indicator}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 ml-5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default ShiftChecklist;
