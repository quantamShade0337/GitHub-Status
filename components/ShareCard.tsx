"use client";

import { useState } from "react";
import { Download, Link2, Check, Loader2 } from "lucide-react";

export function ShareCard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardUrl = `/api/card/${encodeURIComponent(username)}`;

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch(cardUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gitpersona-${username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(cardUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="card p-4">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
        {/* The preview is the real generated PNG. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cardUrl} alt={`${username} GitPersona share card`} className="w-full" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={download}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PNG
        </button>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3.5 py-2 text-sm font-medium transition hover:bg-surface-2"
        >
          {copied ? <Check className="h-4 w-4 text-positive" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
