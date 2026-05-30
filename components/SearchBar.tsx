"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface Props {
  autoFocus?: boolean;
  defaultValue?: string;
  size?: "lg" | "md";
}

function normalize(input: string): string {
  return input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/.*$/, "");
}

export function SearchBar({ autoFocus, defaultValue = "", size = "lg" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const username = normalize(value);
    if (!username) return;
    setSubmitting(true);
    router.push(`/u/${encodeURIComponent(username)}`);
  }

  const big = size === "lg";

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`group relative flex items-center gap-3 rounded-2xl border border-line-strong bg-surface px-4 transition focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10 ${
          big ? "h-14" : "h-12"
        }`}
      >
        <Search className="h-5 w-5 shrink-0 text-muted-2" />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a GitHub username…"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className={`mono min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-2 focus:outline-none ${
            big ? "text-base" : "text-sm"
          }`}
          aria-label="GitHub username"
        />
        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className={`flex shrink-0 items-center gap-2 rounded-xl bg-accent font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 ${
            big ? "h-10 px-4 text-sm" : "h-9 px-3.5 text-sm"
          }`}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Scan</span>
              <span className="sm:hidden">Go</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
