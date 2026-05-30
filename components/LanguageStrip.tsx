import type { LanguageStat } from "@/lib/analysis/types";

/** A thin GitHub-style stacked language bar. Server-safe (no chart lib). */
export function LanguageStrip({
  languages,
  max = 8,
  height = 8,
}: {
  languages: LanguageStat[];
  max?: number;
  height?: number;
}) {
  const top = languages.slice(0, max);
  const shown = top.reduce((a, l) => a + l.percent, 0);
  const rest = Math.max(0, 100 - shown);

  return (
    <div
      className="flex w-full overflow-hidden rounded-full bg-surface-2"
      style={{ height }}
      role="img"
      aria-label="Language breakdown"
    >
      {top.map((l) => (
        <div key={l.name} style={{ width: `${l.percent}%`, background: l.color }} title={`${l.name} ${l.percent}%`} />
      ))}
      {rest > 0 && <div style={{ width: `${rest}%`, background: "var(--muted-2)" }} title={`Other ${rest.toFixed(1)}%`} />}
    </div>
  );
}
