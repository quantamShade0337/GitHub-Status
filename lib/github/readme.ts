import type { Repo } from "@/lib/analysis/types";
import { cached } from "@/lib/cache";
import { ghGetRaw } from "./client";
import { mapWithConcurrency } from "./concurrency";

/**
 * Best-effort README detection for a small set of repos (a polish signal).
 * Bounded and cached so it never dominates the scan's request budget.
 */
export async function detectReadmes(repos: Repo[]): Promise<Map<string, boolean>> {
  const entries = await mapWithConcurrency(repos, 6, async (repo) => {
    const has = await cached(`readme:${repo.fullName.toLowerCase()}`, 60 * 60 * 24, async () => {
      try {
        const res = await ghGetRaw(`/repos/${repo.fullName}/readme`);
        return res.ok;
      } catch {
        return false;
      }
    });
    return [repo.fullName, has] as const;
  });
  return new Map(entries);
}
