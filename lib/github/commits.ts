import type { Confidence, Repo } from "@/lib/analysis/types";
import { cached } from "@/lib/cache";
import { ghGraphQL, hasToken } from "./client";

export interface CommitEstimate {
  total: number;
  confidence: Confidence;
}

interface ContribYear {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      restrictedContributionsCount: number;
    };
  } | null;
}

/**
 * Estimate total commits.
 *  - With a token: sum `totalCommitContributions` year-by-year via GraphQL
 *    (GitHub's own contribution accounting). Medium confidence.
 *  - Without a token: heuristic from repo size + age. Estimated confidence.
 */
export async function estimateCommits(
  username: string,
  repos: Repo[],
  accountCreatedAt: string,
): Promise<CommitEstimate> {
  return cached(`commits:${username.toLowerCase()}`, 60 * 60 * 12, async () => {
    if (hasToken()) {
      try {
        return await commitsFromGraphQL(username, accountCreatedAt);
      } catch {
        // fall through to heuristic if GraphQL fails
      }
    }
    return heuristicCommits(repos);
  });
}

async function commitsFromGraphQL(
  username: string,
  accountCreatedAt: string,
): Promise<CommitEstimate> {
  const startYear = new Date(accountCreatedAt).getUTCFullYear();
  const endYear = new Date().getUTCFullYear();
  const query = `
    query($login:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$login) {
        contributionsCollection(from:$from, to:$to) {
          totalCommitContributions
          restrictedContributionsCount
        }
      }
    }`;

  let total = 0;
  for (let year = startYear; year <= endYear; year++) {
    const from = new Date(Date.UTC(year, 0, 1)).toISOString();
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
    const data = await ghGraphQL<ContribYear>(query, { login: username, from, to });
    const c = data.user?.contributionsCollection;
    if (c) total += c.totalCommitContributions + c.restrictedContributionsCount;
  }
  return { total, confidence: "medium" };
}

function heuristicCommits(repos: Repo[]): CommitEstimate {
  const original = repos.filter((r) => !r.isFork);
  let total = 0;
  for (const repo of original) {
    // Rough: a base handful of commits + a sublinear function of code size.
    const sizeComponent = Math.min(1500, Math.round(Math.pow(repo.sizeKb, 0.6)));
    total += 5 + sizeComponent;
  }
  return { total, confidence: "estimated" };
}
