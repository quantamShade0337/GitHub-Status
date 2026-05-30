import type {
  ActivityPoint,
  LanguageStat,
  Repo,
  RepoCategory,
  ScanStats,
  Scores,
} from "./types";

export interface ScoringInput {
  repos: Repo[]; // original (non-fork) repos
  stats: ScanStats;
  languages: LanguageStat[];
  categories: { name: RepoCategory; count: number }[];
  timeline: ActivityPoint[];
  largestRepoKb: number;
}

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const round = (x: number) => Math.round(clamp(x));

/**
 * Bounded saturation curve: returns 0–100, hitting 50 when `value === half`.
 * Diminishing returns means a prolific account never trivially maxes out.
 */
const saturate = (value: number, half: number) =>
  value <= 0 ? 0 : (100 * value) / (value + half);

function ratio(predicate: (r: Repo) => boolean, repos: Repo[]): number {
  if (repos.length === 0) return 0;
  return repos.filter(predicate).length / repos.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysBetween(a: string, b: string | null): number {
  if (!b) return 0;
  return Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function computeScores(input: ScoringInput): Scores {
  const { repos, stats, languages, categories, timeline, largestRepoKb } = input;
  const repoCount = repos.length;
  const accountAge = Math.max(1, stats.accountAgeYears);

  // ── Output: how much has been built ────────────────────────────────────────
  const output = round(
    0.3 * saturate(stats.originalRepos, 25) +
      0.3 * saturate(stats.estimatedLoc, 150_000) +
      0.25 * saturate(stats.estimatedCommits, 1_500) +
      0.15 * saturate(stats.totalStars + stats.totalForks, 50),
  );

  // ── Consistency: how regularly they code ───────────────────────────────────
  const lastPush = repos.reduce<string | null>((acc, r) => {
    if (!r.pushedAt) return acc;
    return !acc || r.pushedAt > acc ? r.pushedAt : acc;
  }, null);
  const monthsSinceLastPush = lastPush
    ? (Date.now() - new Date(lastPush).getTime()) / (86_400_000 * 30)
    : 36;
  const recencyScore = clamp(100 - monthsSinceLastPush * 8);
  const yearsWithActivity = timeline.filter((t) => t.pushes > 0 || t.repos > 0).length;
  const spread = clamp((yearsWithActivity / accountAge) * 100);
  const activeYearRatio = clamp((stats.activeYears / accountAge) * 100);
  const consistency = round(0.4 * recencyScore + 0.35 * spread + 0.25 * activeYearRatio);

  // ── Depth: large, maintained projects ──────────────────────────────────────
  const lifespans = repos.map((r) => daysBetween(r.createdAt, r.pushedAt));
  const maintenance = saturate(median(lifespans), 180);
  const commitsPerRepo = saturate(stats.estimatedCommits / Math.max(1, stats.originalRepos), 80);
  const depth = round(
    0.3 * saturate(stats.avgRepoSizeKb, 4_000) +
      0.3 * maintenance +
      0.25 * commitsPerRepo +
      0.15 * saturate(largestRepoKb, 20_000),
  );

  // ── Diversity: language + project variety ──────────────────────────────────
  const effectiveLangs = languages.filter((l) => l.percent >= 2).length;
  const fractions = languages.map((l) => l.percent / 100);
  const hhi = fractions.reduce((acc, f) => acc + f * f, 0); // 0..1, lower = more even
  const evenness = clamp((1 - hhi) * 100);
  const diversity = round(
    0.4 * saturate(effectiveLangs, 6) + 0.3 * evenness + 0.3 * saturate(categories.length, 5),
  );

  // ── Polish: how presentable the projects are ───────────────────────────────
  const descRatio = ratio((r) => Boolean(r.description), repos) * 100;
  const topicRatio = ratio((r) => r.topics.length > 0, repos) * 100;
  const licenseRatio = ratio((r) => Boolean(r.license), repos) * 100;
  const homepageRatio = ratio((r) => Boolean(r.homepage), repos) * 100;
  const readmeRatio = ratio((r) => r.hasReadme, repos) * 100;
  const polish = round(
    0.25 * descRatio +
      0.2 * topicRatio +
      0.15 * licenseRatio +
      0.15 * homepageRatio +
      0.1 * readmeRatio +
      0.15 * saturate(stats.totalStars, 30),
  );

  // ── Experimentation: builder energy ────────────────────────────────────────
  const newPerYear = stats.originalRepos / accountAge;
  const smallRepoRatio = ratio((r) => r.sizeKb < 500, repos) * 100;
  const distinctTopics = new Set(repos.flatMap((r) => r.topics)).size;
  const experimentation = round(
    0.35 * saturate(stats.originalRepos, 30) +
      0.3 * saturate(newPerYear, 8) +
      0.2 * smallRepoRatio +
      0.15 * saturate(distinctTopics, 15),
  );

  void repoCount;
  return { output, consistency, depth, diversity, polish, experimentation };
}
