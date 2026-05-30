import type { GitHubProfile } from "@/lib/analysis/types";
import { cached } from "@/lib/cache";
import { ghGet } from "./client";

interface RawUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
  html_url: string;
  type: string;
}

export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//i, "").replace(/\/.*$/, "");
}

/** Basic, high-confidence username validity check before hitting the API. */
export function isValidUsername(username: string): boolean {
  // GitHub usernames: 1–39 chars, alphanumeric or hyphens, no leading/trailing hyphen.
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username);
}

export async function fetchProfile(username: string): Promise<GitHubProfile> {
  return cached(`profile:${username.toLowerCase()}`, 60 * 60 * 6, async () => {
    const raw = await ghGet<RawUser>(`/users/${encodeURIComponent(username)}`);
    return {
      login: raw.login,
      name: raw.name,
      avatarUrl: raw.avatar_url,
      bio: raw.bio,
      location: raw.location,
      company: raw.company,
      blog: raw.blog && raw.blog.trim() ? raw.blog.trim() : null,
      twitter: raw.twitter_username,
      followers: raw.followers,
      following: raw.following,
      publicRepos: raw.public_repos,
      publicGists: raw.public_gists,
      createdAt: raw.created_at,
      htmlUrl: raw.html_url,
      type: raw.type === "Organization" ? "Organization" : "User",
    };
  });
}
