import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Star,
  GitFork,
  FileCode2,
  GitCommitHorizontal,
  FolderGit2,
  CalendarClock,
  GitCompare,
  Info,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { getScan } from "@/lib/scanService";
import type { ScanResult } from "@/lib/analysis/types";
import { formatNumber } from "@/lib/utils";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ArchetypeHero } from "@/components/ArchetypeHero";
import { StatCard } from "@/components/StatCard";
import { Card, SectionHeading, ConfidenceBadge } from "@/components/primitives";
import { ScoreGrid } from "@/components/Scores";
import {
  LanguageDonut,
  ActivityTimeline,
  TIMELINE_CREATED,
  TIMELINE_PUSHED,
} from "@/components/charts";
import { LanguageStrip } from "@/components/LanguageStrip";
import { RepoCard } from "@/components/RepoCard";
import { SkillTree } from "@/components/SkillTree";
import { ShareCard } from "@/components/ShareCard";
import { ScanErrorState } from "@/components/ScanErrorState";
import { clientIp, enforceRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  try {
    const scan = await getScan(username);
    const title = `${scan.profile.name || scan.username} — ${scan.archetype.name}`;
    const image = `/api/card/${encodeURIComponent(scan.username)}`;
    return {
      title,
      description: scan.personality.summary,
      openGraph: { title, description: scan.personality.summary, images: [image] },
      twitter: { card: "summary_large_image", images: [image] },
    };
  } catch {
    return { title: `@${username}` };
  }
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  let scan: ScanResult | null = null;
  let error: unknown = null;
  try {
    await enforceRateLimit(`page-scan:${clientIp(await headers())}`, { limit: 30, windowSec: 60 });
    scan = await getScan(username);
  } catch (e) {
    error = e;
  }

  if (!scan) return <ScanErrorState error={error} username={username} />;

  const { stats, profile, languages, personality, confidence } = scan;
  const joinedYear = new Date(profile.createdAt).getUTCFullYear();
  const topLang = languages[0];

  return (
    <div>
      <div className="mx-auto max-w-5xl space-y-8 px-5 py-10">
        {/* Profile header */}
        <ProfileHeader scan={scan} />

        {/* Notices */}
        {(scan.partial || !scan.tokenUsed) && (
          <div className="flex flex-col gap-2">
            {scan.partial && (
              <div className="flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-2.5 text-sm text-muted">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                Some deep stats couldn&apos;t be fully computed, so parts of this report are
                estimated from available data.
              </div>
            )}
            {!scan.tokenUsed && (
              <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-muted-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Running in unauthenticated mode. Commit counts use a heuristic estimate — add a
                GitHub token for contribution-accurate numbers.{" "}
                <Link href="/about" className="text-accent hover:underline">
                  Learn more
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Archetype hero */}
        <ArchetypeHero scan={scan} />

        {/* Core stats grid */}
        <section>
          <SectionHeading title="Core stats" hint="The numbers behind the profile" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              label="Public repos"
              value={stats.totalRepos}
              hint={`${stats.originalRepos} original · ${stats.forkedRepos} forks`}
              confidence="high"
              icon={<FolderGit2 className="h-4 w-4" />}
            />
            <StatCard
              label="Est. source lines"
              value={stats.estimatedLoc}
              format="compact"
              hint="excludes generated files"
              confidence="estimated"
              icon={<FileCode2 className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Est. commits"
              value={stats.estimatedCommits}
              format="number"
              hint={scan.tokenUsed ? "from contribution history" : "heuristic estimate"}
              confidence={confidence.commits}
              icon={<GitCommitHorizontal className="h-4 w-4" />}
            />
            <StatCard
              label="Total stars"
              value={stats.totalStars}
              format="number"
              hint={`${formatNumber(stats.totalForks)} forks`}
              confidence="high"
              icon={<Star className="h-4 w-4" />}
            />
            <StatCard
              label="Active repos"
              value={stats.activeRepos}
              hint="pushed in last 12 months"
              confidence="high"
              icon={<GitFork className="h-4 w-4" />}
            />
            <StatCard
              label="Years active"
              value={stats.activeYears}
              hint={`joined ${joinedYear}`}
              confidence="medium"
              icon={<CalendarClock className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Languages */}
        <section>
          <SectionHeading
            title="Language DNA"
            hint="By bytes across all original repos"
            action={<ConfidenceBadge level={confidence.languages} />}
          />
          <Card className="p-5">
            {topLang && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted">
                Top language:
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: topLang.color }} />
                  {topLang.name}
                </span>
                <span className="mono text-muted-2">{topLang.percent}%</span>
              </div>
            )}
            <LanguageStrip languages={languages} height={10} />
            <div className="mt-6">
              <LanguageDonut languages={languages} />
            </div>
          </Card>
        </section>

        {/* Scores */}
        <section>
          <SectionHeading title="Skill scores" hint="Six dimensions, each 0–100" />
          <ScoreGrid scores={scan.scores} />
        </section>

        {/* Activity timeline */}
        <section>
          <SectionHeading title="Activity over time" hint="Repos created and pushed each year" />
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-4 text-xs text-muted-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TIMELINE_CREATED }} />{" "}
                created
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TIMELINE_PUSHED }} />{" "}
                pushed
              </span>
            </div>
            <ActivityTimeline data={scan.timeline} />
          </Card>
        </section>

        {/* Top projects */}
        {scan.topRepos.length > 0 && (
          <section>
            <SectionHeading title="Top projects" hint="Most-starred original repositories" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scan.topRepos.map((repo) => (
                <RepoCard key={repo.fullName} repo={repo} />
              ))}
            </div>
          </section>
        )}

        {/* Personality: skill tree + strengths/weaknesses */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <SectionHeading title="Skill tree" hint="Your strongest languages" />
            <SkillTree skills={scan.skillTree} />
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-positive">
                <Sparkles className="h-4 w-4" /> Strengths
              </h3>
              <ul className="mt-3 space-y-2">
                {personality.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-positive" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-warning">
                <TrendingUp className="h-4 w-4" /> Room to grow
              </h3>
              <ul className="mt-3 space-y-2">
                {personality.weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Personality summary + next move */}
        <Card className="p-6 sm:p-8">
          <p className="eyebrow">Developer personality</p>
          <p className="mt-3 text-pretty text-lg leading-relaxed">{personality.summary}</p>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="eyebrow text-accent">Suggested next move</p>
              <p className="mt-1.5 text-sm text-muted">{personality.nextMove}</p>
            </div>
          </div>
        </Card>

        {/* Share card */}
        <section>
          <SectionHeading
            title="Share card"
            hint="Download a polished card for X, GitHub, or LinkedIn"
          />
          <ShareCard username={scan.username} />
        </section>

        {/* Compare CTA */}
        <Card className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2">
              <GitCompare className="h-5 w-5 text-accent" />
            </span>
            <div>
              <p className="font-semibold">Compare with a friend</p>
              <p className="text-sm text-muted-2">See who ships more, who goes deeper.</p>
            </div>
          </div>
          <Link
            href={`/compare?u1=${encodeURIComponent(scan.username)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2 text-sm font-medium transition hover:bg-surface-2"
          >
            Compare <GitCompare className="h-4 w-4" />
          </Link>
        </Card>

        <p className="pt-2 text-center text-xs text-muted-2">
          Scanned {new Date(scan.generatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          <Link href="/about" className="hover:text-foreground">
            how these stats are calculated
          </Link>
        </p>
      </div>
    </div>
  );
}
