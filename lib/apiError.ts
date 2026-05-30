import {
  GitHubNotFoundError,
  GitHubRateLimitError,
  GitHubError,
} from "./github/client";
import { InvalidUsernameError } from "./analysis/scan";
import { RateLimitError } from "./rateLimit";

export interface ApiErrorBody {
  error: string;
  code:
    | "invalid_username"
    | "not_found"
    | "rate_limited"
    | "too_many_requests"
    | "github_error"
    | "internal";
  resetAt?: string;
  tokenPresent?: boolean;
}

/** Map any thrown error to a JSON Response with an appropriate status. */
export function errorResponse(err: unknown): Response {
  if (err instanceof RateLimitError) {
    return json(
      { error: "You're scanning too fast. Please slow down.", code: "too_many_requests" },
      429,
      { "Retry-After": String(err.retryAfterSec) },
    );
  }
  if (err instanceof InvalidUsernameError) {
    return json({ error: err.message, code: "invalid_username" }, 400);
  }
  if (err instanceof GitHubNotFoundError) {
    return json(
      { error: "No public GitHub account with that username.", code: "not_found" },
      404,
    );
  }
  if (err instanceof GitHubRateLimitError) {
    return json(
      {
        error: err.tokenPresent
          ? "GitHub API rate limit reached. Try again shortly."
          : "GitHub's unauthenticated rate limit (60/hr) was hit. Add a GITHUB_TOKEN to raise it to 5,000/hr.",
        code: "rate_limited",
        resetAt: err.resetAt?.toISOString(),
        tokenPresent: err.tokenPresent,
      },
      429,
    );
  }
  if (err instanceof GitHubError) {
    return json({ error: "GitHub API error. Please try again.", code: "github_error" }, 502);
  }
  console.error("[api] unexpected error", err);
  return json({ error: "Something went wrong while scanning.", code: "internal" }, 500);
}

function json(body: ApiErrorBody, status: number, headers?: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}
