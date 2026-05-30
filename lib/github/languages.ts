import type { LanguageStat, Repo } from "@/lib/analysis/types";
import { cached } from "@/lib/cache";
import { colorFor } from "@/lib/analysis/languageMeta";
import { ghGet, hasToken } from "./client";
import { mapWithConcurrency } from "./concurrency";

/** How many repos to fetch precise byte breakdowns for. The rest are approximated. */
const DEEP_LANGUAGE_REPOS_WITH_TOKEN = 60;
const DEEP_LANGUAGE_REPOS_ANON = 12;

async function fetchRepoLanguages(repo: Repo): Promise<Record<string, number>> {
  return cached(`lang:${repo.fullName.toLowerCase()}`, 60 * 60 * 24, async () => {
    try {
      return await ghGet<Record<string, number>>(
        `/repos/${repo.fullName}/languages`,
      );
    } catch {
      return {};
    }
  });
}

export interface LanguageAggregate {
  languages: LanguageStat[];
  /** "medium" when we got real bytes for the heavy repos, "estimated" when mostly approximated. */
  confidence: "medium" | "estimated";
}

/**
 * Aggregate language usage across a user's repos by byte count (per PRD §8).
 * We fetch precise breakdowns for the largest N non-fork repos and approximate
 * the long tail from each repo's primary language × size, which keeps the
 * request count bounded while staying accurate where it matters.
 */
export async function aggregateLanguages(
  username: string,
  repos: Repo[],
): Promise<LanguageAggregate> {
  return cached(`langagg:${username.toLowerCase()}`, 60 * 60 * 6, async () => {
    const considered = repos.filter((r) => !r.isFork);
    const deepCount = hasToken() ? DEEP_LANGUAGE_REPOS_WITH_TOKEN : DEEP_LANGUAGE_REPOS_ANON;

    // Prioritize the biggest repos for precise breakdowns.
    const bySize = [...considered].sort((a, b) => b.sizeKb - a.sizeKb);
    const deepRepos = bySize.slice(0, deepCount);
    const shallowRepos = bySize.slice(deepCount);

    const bytes = new Map<string, number>();
    const add = (lang: string, n: number) => bytes.set(lang, (bytes.get(lang) ?? 0) + n);

    const deepResults = await mapWithConcurrency(deepRepos, 8, fetchRepoLanguages);
    for (const result of deepResults) {
      for (const [lang, n] of Object.entries(result)) add(lang, n);
    }

    // Approximate the tail: treat repo size (KB→bytes) as primary-language bytes.
    for (const repo of shallowRepos) {
      if (repo.primaryLanguage) add(repo.primaryLanguage, repo.sizeKb * 1024);
    }

    const total = [...bytes.values()].reduce((a, b) => a + b, 0);
    if (total === 0) {
      return { languages: [], confidence: "estimated" as const };
    }

    const languages: LanguageStat[] = [...bytes.entries()]
      .map(([name, b]) => ({
        name,
        bytes: b,
        percent: Math.round((b / total) * 1000) / 10,
        color: colorFor(name),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const confidence = shallowRepos.length > deepRepos.length ? "estimated" : "medium";
    return { languages, confidence };
  });
}
