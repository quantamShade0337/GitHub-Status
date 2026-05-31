"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { ActivityPoint, LanguageStat } from "@/lib/analysis/types";

// Data-viz colors. Kept as hex (SVG fill attributes don't resolve CSS vars) and
// re-exported so the timeline legend matches the bars exactly.
export const TIMELINE_CREATED = "#a855f7";
export const TIMELINE_PUSHED = "#22d3ee";

export function LanguageDonut({ languages }: { languages: LanguageStat[] }) {
  const top = languages.slice(0, 7);
  const rest = languages.slice(7).reduce((a, l) => a + l.percent, 0);
  const data = [
    ...top.map((l) => ({ name: l.name, value: l.percent, color: l.color })),
    ...(rest > 0.5 ? [{ name: "Other", value: Math.round(rest * 10) / 10, color: "#6b6b78" }] : []),
  ];

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-2">
        No language data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[200px_1fr]">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--line-strong)",
                borderRadius: 12,
                fontSize: 12,
              }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(value, name) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="mono shrink-0 text-muted-2">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityTimeline({ data }: { data: ActivityPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-2">
        No activity data
      </div>
    );
  }
  // With only a couple of years, a full-width chart strands each year's bars at
  // opposite edges of a huge category band. Cap the width per year and center it
  // so the created/pushed pair always sits together under its label.
  const maxWidth = Math.max(data.length, 2) * 96;

  return (
    <div className="mx-auto h-[180px] w-full" style={{ maxWidth }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
          barGap={3}
          barCategoryGap="26%"
        >
          <XAxis
            dataKey="year"
            tick={{ fill: "var(--muted-2)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "var(--surface-2)",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              fontSize: 12,
            }}
            itemStyle={{ color: "var(--foreground)" }}
            labelStyle={{ color: "var(--muted)" }}
            formatter={(value, name) => [
              value,
              name === "pushes" ? "repos pushed" : "repos created",
            ]}
          />
          <Bar dataKey="repos" fill={TIMELINE_CREATED} radius={[4, 4, 0, 0]} maxBarSize={34} />
          <Bar dataKey="pushes" fill={TIMELINE_PUSHED} radius={[4, 4, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
