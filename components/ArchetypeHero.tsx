import type { ScanResult } from "@/lib/analysis/types";
import { ScoreRing } from "./ScoreRing";

export function ArchetypeHero({ scan }: { scan: ScanResult }) {
  const { archetype, scores } = scan;

  return (
    <div
      className="card relative overflow-hidden p-6 sm:p-8"
      style={{ boxShadow: `inset 0 0 0 1px ${archetype.color}22` }}
    >
      {/* accent wash */}
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: archetype.color }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-2">
            Developer archetype
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ background: `${archetype.color}1f`, boxShadow: `inset 0 0 0 1px ${archetype.color}40` }}
            >
              {archetype.emoji}
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{archetype.name}</h2>
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: archetype.color }}>
            {archetype.tagline}
          </p>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted">
            {archetype.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center sm:flex-col">
          <ScoreRing value={scores.output} color={archetype.color} label="Output" size={150} />
        </div>
      </div>
    </div>
  );
}
