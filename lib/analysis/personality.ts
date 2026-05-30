import { ARCHETYPES, DEFAULT_ARCHETYPE_KEY } from "./archetypes";
import type {
  Archetype,
  GitHubProfile,
  LanguageStat,
  Personality,
  RepoCategory,
  ScanStats,
  ScoreKey,
  Scores,
} from "./types";

export interface PersonaInput {
  profile: GitHubProfile;
  scores: Scores;
  stats: ScanStats;
  languages: LanguageStat[];
  categories: { name: RepoCategory; count: number }[];
  forkRatio: number; // forks / total repos
  avgStars: number; // total stars / original repos
  newReposPerYear: number;
}

function categoryRatio(input: PersonaInput, name: RepoCategory): number {
  const total = input.categories.reduce((a, c) => a + c.count, 0);
  if (total === 0) return 0;
  return (input.categories.find((c) => c.name === name)?.count ?? 0) / total;
}

/** Deterministic archetype assignment: score every archetype, take the best. */
export function assignArchetype(input: PersonaInput): Archetype {
  const s = input.scores;
  const n = (x: number) => x / 100;

  const frontend = categoryRatio(input, "Frontend") + categoryRatio(input, "Mobile") * 0.5;
  const backend = categoryRatio(input, "Backend") + categoryRatio(input, "DevOps / Infra") * 0.7;
  const systems = categoryRatio(input, "Systems / CLI");
  const ai = categoryRatio(input, "AI / Data");
  const lowStars = input.avgStars < 2 ? 1 : input.avgStars < 5 ? 0.5 : 0;

  const matchers: Record<string, number> = {
    "prototype-alchemist":
      0.5 * n(s.experimentation) + 0.25 * (1 - n(s.depth)) + 0.15 * lowStars + 0.1 * n(s.diversity),
    "frontend-craftsman": 0.6 * frontend + 0.25 * n(s.polish) + 0.15 * n(s.diversity),
    "backend-engineer": 0.65 * backend + 0.2 * n(s.depth) + 0.15 * (1 - frontend),
    "open-source-monk":
      0.45 * n(s.consistency) + 0.3 * n(s.depth) + 0.25 * Math.min(1, input.avgStars / 10),
    "fullstack-shapeshifter":
      0.5 * (1 - Math.abs(frontend - backend)) * Math.min(1, (frontend + backend) * 1.5) +
      0.5 * n(s.diversity),
    "ai-tinkerer": 0.7 * ai + 0.3 * n(s.experimentation),
    "systems-goblin": 0.75 * systems + 0.25 * n(s.depth),
    "weekend-builder":
      0.45 * n(s.experimentation) + 0.4 * (1 - n(s.consistency)) + 0.15 * Math.min(1, input.newReposPerYear / 10),
    "silent-operator":
      0.5 * n(s.depth) + 0.5 * (input.stats.originalRepos <= 8 ? 1 : Math.max(0, 1 - input.stats.originalRepos / 25)),
    "tutorial-survivor":
      0.55 * input.forkRatio + 0.25 * (1 - n(s.depth)) + 0.2 * lowStars,
  };

  let bestKey = DEFAULT_ARCHETYPE_KEY;
  let best = -Infinity;
  for (const [key, score] of Object.entries(matchers)) {
    if (score > best) {
      best = score;
      bestKey = key;
    }
  }
  return ARCHETYPES[bestKey];
}

const SCORE_LABELS: Record<ScoreKey, { strength: string; weakness: string }> = {
  output: {
    strength: "Ships a high volume of work",
    weakness: "Could build a larger body of public work",
  },
  consistency: {
    strength: "Codes regularly and recently",
    weakness: "Activity is sporadic — steadier cadence would help",
  },
  depth: {
    strength: "Builds substantial, maintained projects",
    weakness: "Projects stay shallow — try maintaining a few longer",
  },
  diversity: {
    strength: "Comfortable across many languages and domains",
    weakness: "Fairly narrow language/project range",
  },
  polish: {
    strength: "Projects are presentable and well-documented",
    weakness: "READMEs, descriptions, and topics need love",
  },
  experimentation: {
    strength: "Constantly starting new things",
    weakness: "Few new experiments lately",
  },
};

const NEXT_MOVE: Record<ScoreKey, string> = {
  output:
    "Ship one more substantial project this quarter — depth of output is what people notice first.",
  consistency:
    "Make small commits more often. Even a few pushes a week dramatically changes how your profile reads.",
  depth:
    "Pick your single best idea and go deep: keep maintaining it, grow it past the prototype stage.",
  diversity:
    "Stretch into one new language or domain — it broadens both your skills and your profile's story.",
  polish:
    "Pick your best 3 projects, write real READMEs with screenshots, add topics and a license, and link a demo.",
  experimentation:
    "Start a couple of small, scrappy experiments — they keep your profile alive and your skills sharp.",
};

function orderedScores(scores: Scores): { key: ScoreKey; value: number }[] {
  return (Object.entries(scores) as [ScoreKey, number][])
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildPersonality(input: PersonaInput, archetype: Archetype): Personality {
  const { profile, scores, languages, stats } = input;
  const ordered = orderedScores(scores);
  const top = ordered.slice(0, 2);
  const bottom = ordered.slice(-2).reverse(); // weakest first
  const who = profile.name?.split(" ")[0] || profile.login;
  const topLang = languages[0]?.name;
  const dominant = [...input.categories].sort((a, b) => b.count - a.count)[0]?.name;

  const article = /^[aeiou]/i.test(archetype.name) ? "an" : "a";
  const summaryParts: string[] = [];
  summaryParts.push(`${who} is ${article} ${archetype.name}.`);
  if (topLang) {
    summaryParts.push(
      `Their GitHub leans on ${topLang}${
        languages[1] ? ` and ${languages[1].name}` : ""
      }${dominant && dominant !== "Other" ? `, with a clear ${dominant.toLowerCase()} focus` : ""}.`,
    );
  }
  summaryParts.push(
    `Across ${stats.originalRepos} original ${plural(stats.originalRepos, "repo")} and ~${formatCompact(
      stats.estimatedLoc,
    )} estimated source lines, the profile shows ${describeTop(top)}.`,
  );
  if (archetype.tagline) summaryParts.push(archetype.tagline);

  const strengths = top.map((t) => SCORE_LABELS[t.key].strength);
  const weaknesses = bottom.map((t) => SCORE_LABELS[t.key].weakness);
  const weakest = bottom[0]?.key ?? "polish";

  return {
    summary: summaryParts.join(" "),
    strengths,
    weaknesses,
    nextMove: NEXT_MOVE[weakest],
  };
}

function describeTop(top: { key: ScoreKey; value: number }[]): string {
  const phrases: Record<ScoreKey, string> = {
    output: "strong output",
    consistency: "steady consistency",
    depth: "real depth",
    diversity: "broad range",
    polish: "good polish",
    experimentation: "high experimentation",
  };
  if (top.length === 0) return "a developing profile";
  if (top.length === 1) return phrases[top[0].key];
  return `${phrases[top[0].key]} and ${phrases[top[1].key]}`;
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}
