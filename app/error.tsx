"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 ring-1 ring-line-strong">
        <AlertTriangle className="h-6 w-6 text-warning" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-line-strong px-4 py-2 text-sm font-medium transition hover:bg-surface-2"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
