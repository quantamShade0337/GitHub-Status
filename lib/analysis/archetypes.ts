import type { Archetype } from "./types";

/** The ten developer archetypes from the PRD (§6), with display metadata. */
export const ARCHETYPES: Record<string, Archetype> = {
  "prototype-alchemist": {
    key: "prototype-alchemist",
    name: "Prototype Alchemist",
    icon: "FlaskConical",
    tagline: "Fast builder. Product-minded. High experimentation.",
    description:
      "You turn ideas into repos at a remarkable rate. Lots of small, varied projects, a bias for shipping over polishing, and a willingness to start fresh rather than maintain. High output, high energy, low ceremony.",
    color: "#a855f7",
  },
  "frontend-craftsman": {
    key: "frontend-craftsman",
    name: "Frontend Craftsman",
    icon: "Palette",
    tagline: "UI-focused. Design-aware. Pixel-conscious.",
    description:
      "Your work centers on interfaces, websites, and polished front-of-house experiences. Strong product taste, attention to how things look and feel, and a portfolio that's pleasant to actually use.",
    color: "#ec4899",
  },
  "backend-engineer": {
    key: "backend-engineer",
    name: "Backend Engineer",
    icon: "Server",
    tagline: "APIs, data, and the machinery behind the scenes.",
    description:
      "You build the parts users never see but always rely on: APIs, databases, services, and infrastructure. Substance over surface, with an instinct for how systems fit together.",
    color: "#22c55e",
  },
  "open-source-monk": {
    key: "open-source-monk",
    name: "Open Source Monk",
    icon: "HeartHandshake",
    tagline: "Consistent, patient, community-minded.",
    description:
      "You show up. Long-term, steady contribution and well-maintained projects matter more to you than flashy launches. The kind of developer whose repos people actually depend on.",
    color: "#0ea5e9",
  },
  "fullstack-shapeshifter": {
    key: "fullstack-shapeshifter",
    name: "Full-Stack Shapeshifter",
    icon: "Layers",
    tagline: "Frontend, backend, whatever the project needs.",
    description:
      "You move fluidly across the stack with a balanced language mix and diverse project types. Comfortable owning a feature end-to-end, from database to button.",
    color: "#14b8a6",
  },
  "ai-tinkerer": {
    key: "ai-tinkerer",
    name: "AI Tinkerer",
    icon: "BrainCircuit",
    tagline: "Agents, models, data, and Python-shaped curiosity.",
    description:
      "Your repos lean into AI, automation, agents, and data. You experiment at the frontier and wire intelligence into your projects faster than most people read the papers.",
    color: "#8b5cf6",
  },
  "systems-goblin": {
    key: "systems-goblin",
    name: "Systems Goblin",
    icon: "Cpu",
    tagline: "Low-level, performance-hungry, close to the metal.",
    description:
      "Rust, C, C++, Go, CLIs, and things that have to be fast. You like control, performance, and understanding what's really happening underneath the abstractions.",
    color: "#f97316",
  },
  "weekend-builder": {
    key: "weekend-builder",
    name: "Weekend Builder",
    icon: "Zap",
    tagline: "Bursty energy. Intense build windows.",
    description:
      "Your activity comes in spikes — quiet stretches punctuated by intense bursts where a whole project appears overnight. Hackathon energy, channeled into real repos.",
    color: "#eab308",
  },
  "silent-operator": {
    key: "silent-operator",
    name: "Silent Operator",
    icon: "Gem",
    tagline: "Few repos, serious depth.",
    description:
      "You don't flood your profile. What's there is substantial — larger, deeper codebases that reward attention. Quality and focus over quantity and noise.",
    color: "#64748b",
  },
  "tutorial-survivor": {
    key: "tutorial-survivor",
    name: "Tutorial Survivor",
    icon: "Sprout",
    tagline: "Learning by doing, one project at a time.",
    description:
      "Your profile shows the honest trail of someone leveling up — practice repos, forks, and follow-alongs. That's exactly how strong developers start. The next step is making a few of these unmistakably your own.",
    color: "#84cc16",
  },

  // ── Language-identity variants ─────────────────────────────────────────────
  // These win only when a single language or ecosystem clearly dominates a
  // profile, giving a sharper read than the broad behavioral archetypes above.
  "typescript-native": {
    key: "typescript-native",
    name: "TypeScript Native",
    icon: "Braces",
    tagline: "Types on, strict mode, modern web.",
    description:
      "Your work lives in the TypeScript world: typed end to end, modern tooling, and the comfort of a compiler that has your back. You build the kind of codebases other people enjoy contributing to.",
    color: "#3178c6",
  },
  "javascript-native": {
    key: "javascript-native",
    name: "JavaScript Native",
    icon: "CodeXml",
    tagline: "The language of the web, no transpiler required.",
    description:
      "JavaScript is your first language and your default. You move fast in the browser and on the server, reach for the platform before the framework, and ship things people can run by just opening a file.",
    color: "#f1e05a",
  },
  pythonista: {
    key: "pythonista",
    name: "Pythonista",
    icon: "Sigma",
    tagline: "Readable, batteries-included, Python all the way down.",
    description:
      "Python is your home turf: scripts, services, automation, and data work that reads like prose. You value clarity and the enormous ecosystem, and you reach for Python long before anything heavier.",
    color: "#3572A5",
  },
  "markup-artisan": {
    key: "markup-artisan",
    name: "Markup Artisan",
    icon: "PenTool",
    tagline: "HTML and CSS, treated as a craft.",
    description:
      "You build for the browser at the markup layer: semantic HTML, considered CSS, and pages that load fast and look right. The structure and styling other people skip past is exactly where you do your best work.",
    color: "#e34c26",
  },
  rustacean: {
    key: "rustacean",
    name: "Rustacean",
    icon: "Wrench",
    tagline: "Fearless concurrency, zero-cost abstractions.",
    description:
      "Rust is your weapon of choice: memory safety without a garbage collector, performance you can reason about, and a compiler you've learned to trust. You build things meant to be correct and fast.",
    color: "#dea584",
  },
  gopher: {
    key: "gopher",
    name: "Gopher",
    icon: "Gauge",
    tagline: "Simple, fast, and built to ship.",
    description:
      "You write Go: small surface area, fast builds, and services that are boring in the best way. You favor simplicity over cleverness and code that a teammate can read on the first pass.",
    color: "#00ADD8",
  },
  "jvm-engineer": {
    key: "jvm-engineer",
    name: "JVM Engineer",
    icon: "Coffee",
    tagline: "Java, Kotlin, and serious back-of-house systems.",
    description:
      "You work on the JVM, where the libraries are mature and the systems run for years. Strong typing, real tooling, and the kind of dependable engineering that quietly powers large applications.",
    color: "#b07219",
  },
  "mobile-native": {
    key: "mobile-native",
    name: "Mobile Native",
    icon: "Smartphone",
    tagline: "Apps that live in someone's pocket.",
    description:
      "Your focus is the device: Swift, Kotlin, or Dart, and the polish that mobile demands. You think in screens, gestures, and battery life, and you ship experiences people carry around all day.",
    color: "#2dd4bf",
  },
  "data-scientist": {
    key: "data-scientist",
    name: "Data Scientist",
    icon: "BarChart3",
    tagline: "Notebooks, datasets, and findings worth sharing.",
    description:
      "Your repos are full of notebooks, analysis, and data pipelines. You turn raw numbers into insight, and your work is as much about asking the right question as writing the code that answers it.",
    color: "#DA5B0B",
  },
};

export const DEFAULT_ARCHETYPE_KEY = "prototype-alchemist";
