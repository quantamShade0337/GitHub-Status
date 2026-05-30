import type { RepoCategory } from "./types";

/** GitHub-style brand colors for common languages. Falls back to a neutral gray. */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Swift: "#F05138",
  "Objective-C": "#438eff",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  Solidity: "#AA6746",
  Zig: "#ec915c",
  Nix: "#7e7eff",
  Julia: "#a270ba",
  R: "#198CE7",
  "Jupyter Notebook": "#DA5B0B",
  MDX: "#fcb32c",
  Markdown: "#083fa1",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Vim: "#199f4b",
  PowerShell: "#012456",
  Perl: "#0298c3",
  OCaml: "#3be133",
  Clojure: "#db5855",
  Erlang: "#B83998",
  "F#": "#b845fc",
  Crystal: "#000100",
  Nim: "#ffc200",
  Assembly: "#6E4C13",
  GLSL: "#5686a5",
  WebAssembly: "#04133b",
};

export function colorFor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8b8b8b";
}

/** Buckets used by repo categorization and archetype detection. */
const LANGUAGE_CATEGORY: Record<string, RepoCategory> = {
  TypeScript: "Frontend",
  JavaScript: "Frontend",
  HTML: "Frontend",
  CSS: "Frontend",
  SCSS: "Frontend",
  Vue: "Frontend",
  Svelte: "Frontend",
  Astro: "Frontend",
  Python: "Backend",
  Ruby: "Backend",
  PHP: "Backend",
  Java: "Backend",
  "C#": "Backend",
  Go: "Backend",
  Elixir: "Backend",
  Scala: "Backend",
  Swift: "Mobile",
  "Objective-C": "Mobile",
  Kotlin: "Mobile",
  Dart: "Mobile",
  Rust: "Systems / CLI",
  C: "Systems / CLI",
  "C++": "Systems / CLI",
  Zig: "Systems / CLI",
  Nim: "Systems / CLI",
  Assembly: "Systems / CLI",
  "Jupyter Notebook": "AI / Data",
  R: "AI / Data",
  Julia: "AI / Data",
  GLSL: "Game Dev",
  Solidity: "Backend",
  Dockerfile: "DevOps / Infra",
  Shell: "DevOps / Infra",
  Nix: "DevOps / Infra",
  PowerShell: "DevOps / Infra",
};

export function categoryForLanguage(language: string | null): RepoCategory | null {
  if (!language) return null;
  return LANGUAGE_CATEGORY[language] ?? null;
}

/**
 * Rough lines-of-code-per-KB factor per language. GitHub reports repo `size` in
 * KB of the git objects; this converts that into a *very* rough source-line
 * estimate. Verbose/low-density languages get fewer lines per KB. These are
 * deliberately conservative — the UI always labels LOC as "estimated".
 */
export const LOC_PER_KB: Record<string, number> = {
  TypeScript: 22,
  JavaScript: 22,
  Python: 24,
  Ruby: 26,
  Go: 20,
  Rust: 18,
  C: 18,
  "C++": 18,
  "C#": 18,
  Java: 16,
  Swift: 20,
  Kotlin: 20,
  PHP: 22,
  HTML: 14,
  CSS: 16,
  SCSS: 16,
  Shell: 24,
  Lua: 26,
  Dart: 20,
};

export const DEFAULT_LOC_PER_KB = 20;

/** Topic / name keywords that strongly imply a category. */
export const CATEGORY_KEYWORDS: { category: RepoCategory; words: string[] }[] = [
  {
    category: "AI / Data",
    words: [
      "ai", "ml", "llm", "gpt", "agent", "agents", "rag", "embedding", "neural",
      "deep-learning", "machine-learning", "data", "dataset", "pandas", "tensorflow",
      "pytorch", "diffusion", "nlp", "vision", "transformer", "openai", "anthropic",
    ],
  },
  {
    category: "Game Dev",
    words: ["game", "godot", "unity", "unreal", "pixel", "roguelike", "shader", "gamedev", "ecs"],
  },
  {
    category: "DevOps / Infra",
    words: [
      "docker", "kubernetes", "k8s", "terraform", "infra", "infrastructure", "ci",
      "cd", "pipeline", "deploy", "ansible", "helm", "observability", "monitoring",
    ],
  },
  {
    category: "Mobile",
    words: ["ios", "android", "swiftui", "flutter", "react-native", "mobile", "app"],
  },
  {
    category: "Frontend",
    words: [
      "react", "nextjs", "next", "vue", "svelte", "tailwind", "ui", "design-system",
      "frontend", "website", "landing", "portfolio", "dashboard", "component",
    ],
  },
  {
    category: "Backend",
    words: [
      "api", "server", "backend", "graphql", "rest", "database", "db", "auth",
      "microservice", "fastapi", "express", "django", "rails", "postgres",
    ],
  },
  {
    category: "Systems / CLI",
    words: ["cli", "tool", "compiler", "interpreter", "kernel", "low-level", "systems", "wasm"],
  },
  {
    category: "Library / SDK",
    words: ["library", "lib", "sdk", "framework", "package", "plugin", "wrapper"],
  },
];
