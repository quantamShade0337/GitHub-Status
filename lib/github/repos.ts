import type { Repo, RepoCategory } from "@/lib/analysis/types";
import { cached } from "@/lib/cache";
import { CATEGORY_KEYWORDS, categoryForLanguage } from "@/lib/analysis/languageMeta";
import { ghPaginate } from "./client";

interface RawRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  size: number; // KB
  created_at: string;
  pushed_at: string | null;
  updated_at: string | null;
  fork: boolean;
  archived: boolean;
  topics?: string[];
  license: { spdx_id: string | null; name: string } | null;
  default_branch: string;
}

/** Decide a repo's category from its language, topics, and name keywords. */
function categorize(raw: RawRepo): RepoCategory {
  const haystack = `${raw.name} ${(raw.topics ?? []).join(" ")} ${raw.description ?? ""}`.toLowerCase();
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => new RegExp(`(^|[^a-z])${escapeRegExp(w)}([^a-z]|$)`, "i").test(haystack))) {
      return category;
    }
  }
  const byLang = categoryForLanguage(raw.language);
  if (byLang) return byLang;
  return "Other";
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapRepo(raw: RawRepo): Repo {
  return {
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    htmlUrl: raw.html_url,
    homepage: raw.homepage && raw.homepage.trim() ? raw.homepage.trim() : null,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    watchers: raw.watchers_count,
    openIssues: raw.open_issues_count,
    primaryLanguage: raw.language,
    languages: [],
    sizeKb: raw.size,
    createdAt: raw.created_at,
    pushedAt: raw.pushed_at,
    updatedAt: raw.updated_at,
    isFork: raw.fork,
    isArchived: raw.archived,
    hasReadme: false, // populated later for a subset of repos
    topics: raw.topics ?? [],
    license: raw.license?.spdx_id && raw.license.spdx_id !== "NOASSERTION" ? raw.license.spdx_id : null,
    defaultBranch: raw.default_branch,
    category: categorize(raw),
  };
}

/** Fetch all public repos for a user (capped) sorted by most-recently pushed. */
export async function fetchRepos(username: string): Promise<Repo[]> {
  return cached(`repos:${username.toLowerCase()}`, 60 * 60 * 6, async () => {
    const raw = await ghPaginate<RawRepo>(
      `/users/${encodeURIComponent(username)}/repos?sort=pushed&type=owner`,
      { perPage: 100, maxPages: 6 }, // up to ~600 repos
    );
    return raw.map(mapRepo);
  });
}
