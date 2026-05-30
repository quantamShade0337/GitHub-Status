import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock, SearchX } from "lucide-react";
import {
  GitHubNotFoundError,
  GitHubRateLimitError,
} from "@/lib/github/client";
import { InvalidUsernameError } from "@/lib/analysis/scan";
import { RateLimitError } from "@/lib/rateLimit";
import { SearchBar } from "./SearchBar";

function pick(error: unknown, username: string) {
  if (error instanceof RateLimitError) {
    return {
      icon: Clock,
      title: "Slow down a moment",
      body: `You're scanning a little too fast. Give it about ${error.retryAfterSec}s and try again.`,
    };
  }
  if (error instanceof InvalidUsernameError) {
    return {
      icon: SearchX,
      title: "That username doesn't look right",
      body: `"${username}" isn't a valid GitHub username. They're 1–39 characters, letters, numbers, and single hyphens.`,
    };
  }
  if (error instanceof GitHubNotFoundError) {
    return {
      icon: SearchX,
      title: "No such GitHub user",
      body: `We couldn't find a public GitHub account named "${username}". It may have been renamed, deleted, or suspended.`,
    };
  }
  if (error instanceof GitHubRateLimitError) {
    return {
      icon: Clock,
      title: "GitHub rate limit reached",
      body: error.tokenPresent
        ? "We've temporarily hit GitHub's API rate limit. Please try again in a few minutes."
        : "We hit GitHub's unauthenticated limit (60 requests/hour). Adding a GITHUB_TOKEN to the server raises this to 5,000/hour.",
    };
  }
  return {
    icon: AlertTriangle,
    title: "Something went wrong",
    body: "We couldn't finish this scan. GitHub may be having a moment — please try again.",
  };
}

export function ScanErrorState({ error, username }: { error: unknown; username: string }) {
  const { icon: Icon, title, body } = pick(error, username);
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 ring-1 ring-line-strong">
        <Icon className="h-6 w-6 text-muted" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      <div className="mx-auto mt-6 max-w-sm">
        <SearchBar size="md" />
      </div>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-2 transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>
    </div>
  );
}
