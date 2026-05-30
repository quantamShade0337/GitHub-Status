import Link from "next/link";
import { Trophy } from "lucide-react";
import type { ScanResult, ScoreKey } from "@/lib/analysis/types";
import { formatCompact, formatNumber } from "@/lib/utils";

const A_COLOR = "#a855f7";
const B_COLOR = "#22d3ee";

const SCORE_ROWS: { key: ScoreKey; label: string; verb: string }[] = [
  { key: "output", label: "Output", verb: "ships more" },
  { key: "consistency", label: "Consistency", verb: "codes more consistently" },
  { key: "depth", label: "Depth", verb: "builds deeper, maintained projects" },
  { key: "diversity", label: "Diversity", verb: "is more of a polyglot" },
  { key: "polish", label: "Polish", verb: "has more polished work" },
  { key: "experimentation", label: "Experimentation", verb: "is more experimental" },
];

function name(scan: ScanResult): string {
  return scan.profile.name?.split(" ")[0] || scan.username;
}

function ProfileMini({ scan, color }: { scan: ScanResult; color: string }) {
  return (
    <Link href={`/u/${scan.username}`} className="flex flex-col items-center gap-2 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scan.profile.avatarUrl}
        alt=""
        className="h-16 w-16 rounded-2xl ring-2"
        style={{ ["--tw-ring-color" as string]: color, boxShadow: `0 0 0 2px ${color}` }}
      />
      <div>
        <div className="font-semibold">{scan.profile.name || scan.username}</div>
        <div className="mono text-xs text-muted-2">@{scan.username}</div>
      </div>
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"
        style={{ color }}
      >
        {scan.archetype.emoji} {scan.archetype.name}
      </span>
    </Link>
  );
}

function ScoreVersus({ a, b }: { a: ScanResult; b: ScanResult }) {
  return (
    <div className="space-y-4">
      {SCORE_ROWS.map(({ key, label }) => {
        const av = a.scores[key];
        const bv = b.scores[key];
        const total = Math.max(1, av + bv);
        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="mono font-semibold" style={{ color: av >= bv ? A_COLOR : "var(--muted-2)" }}>
                {av}
              </span>
              <span className="text-muted">{label}</span>
              <span className="mono font-semibold" style={{ color: bv >= av ? B_COLOR : "var(--muted-2)" }}>
                {bv}
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div style={{ width: `${(av / total) * 100}%`, background: A_COLOR }} />
              <div className="ml-auto" style={{ width: `${(bv / total) * 100}%`, background: B_COLOR }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsTable({ a, b }: { a: ScanResult; b: ScanResult }) {
  const rows: { label: string; a: number; b: number; fmt: (n: number) => string }[] = [
    { label: "Public repos", a: a.stats.totalRepos, b: b.stats.totalRepos, fmt: formatNumber },
    { label: "Est. source lines", a: a.stats.estimatedLoc, b: b.stats.estimatedLoc, fmt: formatCompact },
    { label: "Est. commits", a: a.stats.estimatedCommits, b: b.stats.estimatedCommits, fmt: formatNumber },
    { label: "Total stars", a: a.stats.totalStars, b: b.stats.totalStars, fmt: formatNumber },
    { label: "Years active", a: a.stats.activeYears, b: b.stats.activeYears, fmt: formatNumber },
  ];
  return (
    <div className="divide-y divide-line">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 text-sm">
          <span className="mono text-right font-semibold" style={{ color: r.a >= r.b ? A_COLOR : "var(--muted-2)" }}>
            {r.fmt(r.a)}
          </span>
          <span className="text-center text-xs text-muted-2">{r.label}</span>
          <span className="mono font-semibold" style={{ color: r.b >= r.a ? B_COLOR : "var(--muted-2)" }}>
            {r.fmt(r.b)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CompareView({ a, b }: { a: ScanResult; b: ScanResult }) {
  const verdicts = SCORE_ROWS.map(({ key, verb }) => {
    const av = a.scores[key];
    const bv = b.scores[key];
    if (Math.abs(av - bv) < 3) return { text: `Neck and neck on ${verb.replace(/^is |^has |^builds |^codes |^ships /, "")}`, tie: true };
    const winner = av > bv ? a : b;
    const color = av > bv ? A_COLOR : B_COLOR;
    return { text: `${name(winner)} ${verb}`, color, tie: false };
  });

  const aWins = SCORE_ROWS.filter(({ key }) => a.scores[key] > b.scores[key]).length;
  const bWins = SCORE_ROWS.filter(({ key }) => b.scores[key] > a.scores[key]).length;
  const overall = aWins === bWins ? null : aWins > bWins ? a : b;

  return (
    <div className="space-y-6">
      {/* heads */}
      <div className="card grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-6">
        <ProfileMini scan={a} color={A_COLOR} />
        <span className="mono text-sm text-muted-2">vs</span>
        <ProfileMini scan={b} color={B_COLOR} />
      </div>

      {/* overall verdict */}
      {overall && (
        <div className="card flex items-center justify-center gap-3 p-4 text-center">
          <Trophy className="h-5 w-5 text-warning" />
          <p className="text-sm">
            <span className="font-semibold" style={{ color: overall === a ? A_COLOR : B_COLOR }}>
              {name(overall)}
            </span>{" "}
            leads on more dimensions ({Math.max(aWins, bWins)}–{Math.min(aWins, bWins)}) — but
            they&apos;re different kinds of developer.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold">Score-by-score</h3>
          <ScoreVersus a={a} b={b} />
        </div>
        <div className="card p-5">
          <h3 className="mb-2 text-sm font-semibold">Key stats</h3>
          <StatsTable a={a} b={b} />
        </div>
      </div>

      {/* who wins what */}
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold">Who wins what</h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {verdicts.map((v, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: v.tie ? "var(--muted-2)" : v.color }}
              />
              {v.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
