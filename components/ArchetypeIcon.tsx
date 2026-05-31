import {
  FlaskConical,
  Palette,
  Server,
  HeartHandshake,
  Layers,
  BrainCircuit,
  Cpu,
  Zap,
  Gem,
  Sprout,
  Hexagon,
  type LucideIcon,
} from "lucide-react";
import type { Archetype } from "@/lib/analysis/types";

/** Maps the icon name stored on each archetype to its lucide component. */
const ICONS: Record<string, LucideIcon> = {
  FlaskConical,
  Palette,
  Server,
  HeartHandshake,
  Layers,
  BrainCircuit,
  Cpu,
  Zap,
  Gem,
  Sprout,
};

export function archetypeIcon(archetype: Pick<Archetype, "icon">): LucideIcon {
  return ICONS[archetype.icon] ?? Hexagon;
}

export function ArchetypeIcon({
  archetype,
  className,
}: {
  archetype: Pick<Archetype, "icon">;
  className?: string;
}) {
  const Icon = archetypeIcon(archetype);
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}
