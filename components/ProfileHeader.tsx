import { MapPin, Users, Calendar, LinkIcon, AtSign } from "lucide-react";
import type { ScanResult } from "@/lib/analysis/types";
import { formatNumber } from "@/lib/utils";

export function ProfileHeader({ scan }: { scan: ScanResult }) {
  const { profile } = scan;
  const joinedYear = new Date(profile.createdAt).getUTCFullYear();

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatarUrl}
        alt={`${profile.login} avatar`}
        className="h-20 w-20 rounded-2xl ring-1 ring-line-strong sm:h-24 sm:w-24"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{profile.name || profile.login}</h1>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono inline-flex items-center gap-1 text-sm text-muted transition hover:text-accent"
          >
            <AtSign className="h-3.5 w-3.5" />
            {profile.login}
          </a>
          {profile.type === "Organization" && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted-2">
              organization
            </span>
          )}
        </div>

        {profile.bio && <p className="mt-1.5 max-w-2xl text-sm text-muted">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-2">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="text-foreground">{formatNumber(profile.followers)}</span> followers
          </span>
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            joined {joinedYear}
          </span>
          {profile.blog && (
            <a
              href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition hover:text-accent"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {profile.blog.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
