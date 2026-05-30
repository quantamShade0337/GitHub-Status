"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";

function normalize(input: string): string {
  return input.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//i, "").replace(/\/.*$/, "");
}

export function CompareForm({ u1 = "", u2 = "" }: { u1?: string; u2?: string }) {
  const router = useRouter();
  const [a, setA] = useState(u1);
  const [b, setB] = useState(u2);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ua = normalize(a);
    const ub = normalize(b);
    if (!ua || !ub) return;
    setLoading(true);
    router.push(`/compare?u1=${encodeURIComponent(ua)}&u2=${encodeURIComponent(ub)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <input
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="First username"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        className="mono h-12 flex-1 rounded-xl border border-line-strong bg-surface px-4 text-sm focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
        aria-label="First GitHub username"
      />
      <span className="text-center text-sm font-medium text-muted-2">vs</span>
      <input
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder="Second username"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        className="mono h-12 flex-1 rounded-xl border border-line-strong bg-surface px-4 text-sm focus:border-accent-2/60 focus:outline-none focus:ring-4 focus:ring-accent-2/10"
        aria-label="Second GitHub username"
      />
      <button
        type="submit"
        disabled={loading || !a.trim() || !b.trim()}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
        Compare
      </button>
    </form>
  );
}
