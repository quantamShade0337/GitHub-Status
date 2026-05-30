"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import type { SkillNode } from "@/lib/analysis/types";
import { colorFor } from "@/lib/analysis/languageMeta";

/** A compact "skill tree" — top languages rendered as leveled skill rows. */
export function SkillTree({ skills }: { skills: SkillNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  if (skills.length === 0) {
    return <p className="text-sm text-muted-2">Not enough data to build a skill tree yet.</p>;
  }

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {skills.map((skill, i) => {
        const color = colorFor(skill.name);
        return (
          <div key={skill.name} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="truncate text-sm font-medium">{skill.name}</span>
                <span className="mono text-xs text-muted-2">{skill.category}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                />
              </div>
            </div>
            <span className="mono w-9 shrink-0 text-right text-xs text-muted">
              {skill.level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
