import { Star, GitFork, ExternalLink } from "lucide-react";
import type { Repo } from "@/lib/analysis/types";
import { colorFor } from "@/lib/analysis/languageMeta";
import { formatNumber, timeAgo } from "@/lib/utils";

export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover group flex flex-col gap-3 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="mono truncate text-sm font-semibold text-foreground group-hover:text-accent">
          {repo.name}
        </h3>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-2 opacity-0 transition group-hover:opacity-100" />
      </div>

      <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted">
        {repo.description || <span className="text-muted-2 italic">No description</span>}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-2">
        {repo.primaryLanguage && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: colorFor(repo.primaryLanguage) }}
            />
            {repo.primaryLanguage}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> {formatNumber(repo.stars)}
          </span>
        )}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" /> {formatNumber(repo.forks)}
          </span>
        )}
        <span className="ml-auto">{timeAgo(repo.pushedAt)}</span>
      </div>

      {(repo.isArchived || repo.category !== "Other") && (
        <div className="flex flex-wrap gap-1.5">
          {repo.category !== "Other" && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted-2">
              {repo.category}
            </span>
          )}
          {repo.isArchived && (
            <span className="rounded-full border border-warning/30 px-2 py-0.5 text-[10px] text-warning">
              archived
            </span>
          )}
        </div>
      )}
    </a>
  );
}
