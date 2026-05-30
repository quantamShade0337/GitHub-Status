import type { MetadataRoute } from "next";
import { getRecentScans } from "@/lib/store";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/compare`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Include recently scanned profiles when persistence is enabled.
  const recent = await getRecentScans(50);
  const profileRoutes: MetadataRoute.Sitemap = recent.map((s) => ({
    url: `${baseUrl}/u/${s.username}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...profileRoutes];
}
