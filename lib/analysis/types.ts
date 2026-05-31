/**
 * Shared type contract for the whole app. The `ScanResult` is the single object
 * produced by the scan orchestrator, stored in the DB, returned by the API, and
 * consumed by every page/component and the share-card renderer.
 */

/** How much to trust a given stat. Surfaced in the UI per the PRD (§18). */
export type Confidence = "high" | "medium" | "estimated";

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  createdAt: string; // ISO
  htmlUrl: string;
  type: "User" | "Organization";
}

export interface RepoLanguage {
  name: string;
  bytes: number;
}

export interface Repo {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  primaryLanguage: string | null;
  /** Full language byte breakdown — only populated for repos we deep-scan. */
  languages: RepoLanguage[];
  sizeKb: number;
  createdAt: string;
  pushedAt: string | null;
  updatedAt: string | null;
  isFork: boolean;
  isArchived: boolean;
  hasReadme: boolean;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  /** Heuristic project category, e.g. "Frontend", "AI / Data". */
  category: RepoCategory;
}

export type RepoCategory =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Systems / CLI"
  | "AI / Data"
  | "Game Dev"
  | "DevOps / Infra"
  | "Library / SDK"
  | "Docs / Config"
  | "Other";

export interface LanguageStat {
  name: string;
  bytes: number;
  percent: number; // 0–100
  color: string; // hex
}

export interface Scores {
  output: number;
  consistency: number;
  depth: number;
  diversity: number;
  polish: number;
  experimentation: number;
}

export type ScoreKey = keyof Scores;

export interface Archetype {
  key: string;
  name: string;
  /** Name of the lucide-react icon used to represent this archetype. */
  icon: string;
  tagline: string;
  description: string;
  color: string; // accent hex
}

export interface SkillNode {
  name: string;
  level: number; // 0–100
  category: string;
}

export interface ActivityPoint {
  year: number;
  repos: number; // repos created that year
  pushes: number; // repos pushed-to that year (activity signal)
}

export interface Personality {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  nextMove: string;
}

export interface ScanStats {
  totalRepos: number;
  originalRepos: number;
  forkedRepos: number;
  archivedRepos: number;
  activeRepos: number; // pushed within last 12 months
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  estimatedLoc: number;
  estimatedCommits: number;
  avgRepoSizeKb: number;
  activeYears: number;
  accountAgeYears: number;
}

export interface ScanConfidence {
  repos: Confidence;
  languages: Confidence;
  commits: Confidence;
  loc: Confidence;
}

export interface ScanResult {
  username: string;
  profile: GitHubProfile;
  generatedAt: string; // ISO
  tokenUsed: boolean;
  /** True when some deep step (e.g. languages) was skipped/failed but basics rendered. */
  partial: boolean;
  stats: ScanStats;
  confidence: ScanConfidence;
  languages: LanguageStat[];
  topRepos: Repo[];
  recentRepos: Repo[];
  largestRepo: Repo | null;
  oldestRepo: Repo | null;
  mostStarredRepo: Repo | null;
  timeline: ActivityPoint[];
  categories: { name: RepoCategory; count: number }[];
  scores: Scores;
  archetype: Archetype;
  personality: Personality;
  skillTree: SkillNode[];
}

/** Compact summary persisted as denormalized columns + used for compare cards. */
export interface ScanSummary {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  archetypeKey: string;
  archetype: string;
  tagline: string | null;
  outputScore: number;
  topLanguage: string | null;
  totalRepos: number;
  estimatedLoc: number;
}
