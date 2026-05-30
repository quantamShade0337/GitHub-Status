import { AnimatedNumber, type NumberFormat } from "./AnimatedNumber";
import { ConfidenceBadge } from "./primitives";
import type { Confidence } from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  format?: NumberFormat;
  suffix?: string;
  hint?: string;
  confidence?: Confidence;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

/** A single animated stat tile for the core stats grid. */
export function StatCard({
  label,
  value,
  format,
  suffix,
  hint,
  confidence,
  icon,
  accent,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "card card-hover flex flex-col justify-between p-4 sm:p-5",
        accent && "ring-1 ring-accent/25",
        className,
      )}
    >
      <div className="flex items-center justify-between text-muted-2">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-muted-2">{icon}</span>}
      </div>
      <div className="mt-3">
        <div className="mono text-2xl font-semibold tabular-nums sm:text-3xl">
          <AnimatedNumber value={value} format={format} />
          {suffix && <span className="ml-1 text-base font-normal text-muted">{suffix}</span>}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {hint && <span className="text-xs text-muted-2">{hint}</span>}
          {confidence && <ConfidenceBadge level={confidence} />}
        </div>
      </div>
    </div>
  );
}
