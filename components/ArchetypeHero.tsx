import type { ScanResult } from "@/lib/analysis/types";
import { ScoreRing } from "./ScoreRing";
import { ArchetypeIcon } from "./ArchetypeIcon";

export function ArchetypeHero({ scan }: { scan: ScanResult }) {
  const { archetype, scores } = scan;

  return (
    <div className="card overflow-hidden">
      {/* Accent rule keyed to the archetype color, replacing the old blur glow. */}
      <div className="h-1 w-full" style={{ background: archetype.color }} aria-hidden />
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <p className="eyebrow">Developer archetype</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${archetype.color} 16%, transparent)`,
                color: archetype.color,
              }}
            >
              <ArchetypeIcon archetype={archetype} className="h-6 w-6" />
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
