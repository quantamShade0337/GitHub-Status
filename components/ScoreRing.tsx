"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

interface Props {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

/** Circular progress ring with an animated count-up center value. */
export function ScoreRing({
  value,
  size = 160,
  stroke = 12,
  color = "var(--accent)",
  label,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setProgress,
    });
    return () => controls.stop();
  }, [inView, value]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-3xl font-bold tabular-nums">{Math.round(progress)}</span>
        {label && (
          <span className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-2">{label}</span>
        )}
      </div>
    </div>
  );
}
