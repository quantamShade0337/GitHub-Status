/**
 * Low-level GitHub API client. Wraps REST + GraphQL with auth, pagination, and
 * typed errors. A token (GITHUB_TOKEN) is optional but raises the rate limit
 * from 60/hr to 5,000/hr.
 */

const REST_BASE = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";
const FETCH_TIMEOUT_MS = 12_000;

/** fetch() with a hard timeout; maps aborts/network errors to a typed GitHubError. */
async function ghFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new GitHubError("GitHub API request timed out", 504);
    }
    throw new GitHubError("Could not reach GitHub", 502);
  }
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(message = "GitHub user not found") {
    super(message, 404);
    this.name = "GitHubNotFoundError";
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(
    readonly resetAt: Date | null,
    readonly tokenPresent: boolean,
  ) {
    super("GitHub API rate limit reached", 403);
    this.name = "GitHubRateLimitError";
  }
}

export function hasToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim());
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitPersona",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (hasToken()) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN!.trim()}`;
  }
  return headers;
}

function handleRateLimit(res: Response): void {
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (res.status === 403 && remaining === "0") {
    const reset = res.headers.get("x-ratelimit-reset");
    const resetAt = reset ? new Date(Number(reset) * 1000) : null;
    throw new GitHubRateLimitError(resetAt, hasToken());
  }
}

/** Single REST GET returning parsed JSON. Throws typed errors for 404 / rate limit. */
export async function ghGet<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${REST_BASE}${path}`;
  const res = await ghFetch(url, { headers: baseHeaders() });

  if (res.status === 404) throw new GitHubNotFoundError();
  handleRateLimit(res);
  if (!res.ok) {
    throw new GitHubError(`GitHub request failed (${res.status}) for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

/** REST GET returning the raw Response (for header inspection / non-JSON). */
export async function ghGetRaw(path: string): Promise<Response> {
  const url = path.startsWith("http") ? path : `${REST_BASE}${path}`;
  const res = await ghFetch(url, { headers: baseHeaders() });
  if (res.status === 404) throw new GitHubNotFoundError();
  handleRateLimit(res);
  return res;
}

/**
 * Paginate a REST list endpoint following `Link: rel="next"` headers.
 * Caps total pages to avoid runaway scans on huge accounts.
 */
export async function ghPaginate<T>(
  path: string,
  { perPage = 100, maxPages = 6 }: { perPage?: number; maxPages?: number } = {},
): Promise<T[]> {
  const results: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  let url: string | null = `${REST_BASE}${path}${sep}per_page=${perPage}`;
  let page = 0;

  while (url && page < maxPages) {
    const res: Response = await ghFetch(url, { headers: baseHeaders() });
    if (res.status === 404) throw new GitHubNotFoundError();
    handleRateLimit(res);
    if (!res.ok) {
      throw new GitHubError(`GitHub pagination failed (${res.status}) for ${path}`, res.status);
    }
    const batch = (await res.json()) as T[];
    results.push(...batch);
    url = parseNextLink(res.headers.get("link"));
    page += 1;
  }
  return results;
}

function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

/** Execute a GraphQL query. Requires a token (GitHub blocks anonymous GraphQL). */
export async function ghGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  if (!hasToken()) {
    throw new GitHubError("GraphQL requires a GITHUB_TOKEN", 401);
  }
  const res = await ghFetch(GRAPHQL_URL, {
    method: "POST",
    headers: { ...baseHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  handleRateLimit(res);
  if (!res.ok) {
    throw new GitHubError(`GitHub GraphQL failed (${res.status})`, res.status);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new GitHubError(json.errors.map((e) => e.message).join("; "), 400);
  }
  return json.data as T;
}
