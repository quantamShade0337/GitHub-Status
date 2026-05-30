import type { Confidence } from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div className={cn("card", hover && "card-hover", className)}>{children}</div>
  );
}

export function Pill({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted",
        className,
      )}
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
      )}
      {children}
    </span>
  );
}

const CONFIDENCE_META: Record<Confidence, { label: string; dot: string; text: string }> = {
  high: { label: "high confidence", dot: "var(--positive)", text: "text-positive" },
  medium: { label: "medium confidence", dot: "var(--warning)", text: "text-warning" },
  estimated: { label: "estimated", dot: "var(--accent)", text: "text-accent" },
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const meta = CONFIDENCE_META[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} aria-hidden />
      {meta.label}
    </span>
  );
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-muted-2">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
