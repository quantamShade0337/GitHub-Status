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
};

export const DEFAULT_ARCHETYPE_KEY = "prototype-alchemist";
