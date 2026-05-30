"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { formatCompact, formatNumber } from "@/lib/utils";

/** Format key instead of a function, so this can be used from Server Components
 * (functions can't cross the server→client boundary). */
export type NumberFormat = "compact" | "number" | "plain";

function applyFormat(n: number, format: NumberFormat): string {
  if (format === "compact") return formatCompact(n);
  if (format === "plain") return String(n);
  return formatNumber(n);
}

interface Props {
  value: number;
  format?: NumberFormat;
  durationMs?: number;
  className?: string;
}

/** Counts up from 0 to `value` once it scrolls into view. */
export function AnimatedNumber({ value, format = "number", durationMs = 1100, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {applyFormat(Math.round(display), format)}
    </span>
  );
}
