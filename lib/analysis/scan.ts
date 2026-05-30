import type {
  ActivityPoint,
  Repo,
  RepoCategory,
  ScanResult,
  SkillNode,
} from "./types";
import { fetchProfile, isValidUsername, normalizeUsername } from "@/lib/github/profile";
import { fetchRepos } from "@/lib/github/repos";
import { aggregateLanguages } from "@/lib/github/languages";
import { estimateCommits, type CommitEstimate } from "@/lib/github/commits";
import { detectReadmes } from "@/lib/github/readme";
import { hasToken } from "@/lib/github/client";
import { categoryForLanguage } from "./languageMeta";
import { estimateLoc } from "./loc";
import { computeScores } from "./scoring";
import { assignArchetype, buildPersonality } from "./personality";
import { GitHubNotFoundError } from "@/lib/github/client";

const YEAR_MS = 365.25 * 86_400_000;

export class InvalidUsernameError extends Error {
  constructor() {
    super("That doesn't look like a valid GitHub username.");
    this.name = "InvalidUsernameError";
  }
}

function yearOf(iso: string | null): number | null {
  return iso ? new Date(iso).getUTCFullYear() : null;
}

function buildTimeline(repos: Repo[], accountCreatedAt: string): ActivityPoint[] {
  const start = new Date(accountCreatedAt).getUTCFullYear();
  const end = new Date().getUTCFullYear();
  const points: ActivityPoint[] = [];
  for (let year = start; year <= end; year++) {
    const created = repos.filter((r) => yearOf(r.createdAt) === year).length;
    const pushed = repos.filter((r) => yearOf(r.pushedAt) === year).length;
    points.push({ year, repos: created, pushes: pushed });
  }
  return points;
}

function buildCategories(repos: Repo[]): { name: RepoCategory; count: number }[] {
  const counts = new Map<RepoCategory, number>();
  for (const r of repos) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function buildSkillTree(languages: { name: string; percent: number }[]): SkillNode[] {
  return languages.slice(0, 6).map((l) => ({
    name: l.name,
    level: Math.max(8, Math.min(100, Math.round(l.percent * 2.2))),
    category: categoryForLanguage(l.name) ?? "Other",
  }));
}

/** Run a full scan for a username and assemble the complete ScanResult. */
export async function runScan(rawUsername: string): Promise<ScanResult> {
  const username = normalizeUsername(rawUsername);
  if (!isValidUsername(username)) throw new InvalidUsernameError();

  const profile = await fetchProfile(username); // throws GitHubNotFoundError if missing
  const repos = await fetchRepos(username);

  let partial = false;

  // Language aggregation + LOC (deepest GitHub work). Degrade gracefully.
  let languages: ScanResult["languages"] = [];
  let langConfidence: "medium" | "estimated" = "estimated";
  try {
    const agg = await aggregateLanguages(username, repos);
    languages = agg.languages;
    langConfidence = agg.confidence;
  } catch {
    partial = true;
  }

  // README detection for top repos (polish signal). Best-effort.
  try {
    const topForReadme = [...repos]
      .filter((r) => !r.isFork)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 10);
    const readmeMap = await detectReadmes(topForReadme);
    for (const r of repos) if (readmeMap.get(r.fullName)) r.hasReadme = true;
  } catch {
    /* non-fatal */
  }

  let commits: CommitEstimate = { total: 0, confidence: "estimated" };
  try {
    commits = await estimateCommits(username, repos, profile.createdAt);
  } catch {
    partial = true;
  }

  // ── Derived stats ───────────────────────────────────────────────────────────
  const original = repos.filter((r) => !r.isFork);
  const forks = repos.filter((r) => r.isFork);
  const archived = repos.filter((r) => r.isArchived);
  const twelveMonthsAgo = Date.now() - YEAR_MS;
  const activeRepos = repos.filter(
    (r) => r.pushedAt && new Date(r.pushedAt).getTime() > twelveMonthsAgo,
  );

  const totalStars = repos.reduce((a, r) => a + r.stars, 0);
  const totalForks = repos.reduce((a, r) => a + r.forks, 0);
  const totalWatchers = repos.reduce((a, r) => a + r.watchers, 0);
  const avgRepoSizeKb =
    original.length > 0 ? Math.round(original.reduce((a, r) => a + r.sizeKb, 0) / original.length) : 0;
  const accountAgeYears = Math.max(0.1, (Date.now() - new Date(profile.createdAt).getTime()) / YEAR_MS);

  const timeline = buildTimeline(repos, profile.createdAt);
  const activeYears = timeline.filter((t) => t.pushes > 0 || t.repos > 0).length;
  const categories = buildCategories(original);
  const estimatedLoc = estimateLoc(languages);

  const stats = {
    totalRepos: repos.length,
    originalRepos: original.length,
    forkedRepos: forks.length,
    archivedRepos: archived.length,
    activeRepos: activeRepos.length,
    totalStars,
    totalForks,
    totalWatchers,
    estimatedLoc,
    estimatedCommits: commits.total,
    avgRepoSizeKb,
    activeYears,
    accountAgeYears: Math.round(accountAgeYears * 10) / 10,
  };

  const byStars = [...original].sort((a, b) => b.stars - a.stars);
  const byPushed = [...original].sort(
    (a, b) => new Date(b.pushedAt ?? 0).getTime() - new Date(a.pushedAt ?? 0).getTime(),
  );
  const bySize = [...original].sort((a, b) => b.sizeKb - a.sizeKb);
  const byAge = [...repos].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const scores = computeScores({
    repos: original,
    stats,
    languages,
    categories,
    timeline,
    largestRepoKb: bySize[0]?.sizeKb ?? 0,
  });

  const personaInput = {
    profile,
    scores,
    stats,
    languages,
    categories,
    forkRatio: repos.length > 0 ? forks.length / repos.length : 0,
    avgStars: original.length > 0 ? totalStars / original.length : 0,
    newReposPerYear: original.length / Math.max(1, accountAgeYears),
  };
  const archetype = assignArchetype(personaInput);
  const personality = buildPersonality(personaInput, archetype);

  return {
    username: profile.login,
    profile,
    generatedAt: new Date().toISOString(),
    tokenUsed: hasToken(),
    partial,
    stats,
    confidence: {
      repos: "high",
      languages: languages.length > 0 ? langConfidence : "estimated",
      commits: commits.confidence,
      loc: "estimated",
    },
    languages,
    topRepos: byStars.slice(0, 6),
    recentRepos: byPushed.slice(0, 6),
    largestRepo: bySize[0] ?? null,
    oldestRepo: byAge[0] ?? null,
    mostStarredRepo: byStars[0] ?? null,
    timeline,
    categories,
    scores,
    archetype,
    personality,
    skillTree: buildSkillTree(languages),
  };
}

export { GitHubNotFoundError };
