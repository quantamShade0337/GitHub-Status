"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import type { ScoreKey, Scores } from "@/lib/analysis/types";

export const SCORE_META: Record<
  ScoreKey,
  { label: string; blurb: string; color: string }
> = {
  output: { label: "Output", blurb: "How much you've built", color: "#a855f7" },
  consistency: { label: "Consistency", blurb: "How regularly you code", color: "#22d3ee" },
  depth: { label: "Depth", blurb: "Large, maintained projects", color: "#34d399" },
  diversity: { label: "Diversity", blurb: "Language & project variety", color: "#fbbf24" },
  polish: { label: "Polish", blurb: "How presentable your work is", color: "#f472b6" },
  experimentation: { label: "Experimentation", blurb: "Builder energy", color: "#60a5fa" },
};

const ORDER: ScoreKey[] = [
  "output",
  "consistency",
  "depth",
  "diversity",
  "polish",
  "experimentation",
];

function ScoreBar({
  label,
  blurb,
  value,
  color,
  delay,
}: {
  label: string;
  blurb: string;
  value: number;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <div ref={ref} className="card p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="mono text-sm font-semibold tabular-nums" style={{ color }}>
          {value}
          <span className="text-muted-2">/100</span>
        </span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}66` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-2">{blurb}</p>
    </div>
  );
}

export function ScoreGrid({ scores }: { scores: Scores }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ORDER.map((key, i) => (
        <ScoreBar
          key={key}
          label={SCORE_META[key].label}
          blurb={SCORE_META[key].blurb}
          value={scores[key]}
          color={SCORE_META[key].color}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
