import type { MetadataRoute } from "next";

import { getCompetitionSlugs } from "@/lib/competitions";
import { SITE_URL } from "@/lib/site-links";
import { loadStoreProductIds } from "@/lib/store-catalog.server";

const siteUrl = SITE_URL;

/** Live catalog ids; empty if the catalog is missing or fails to load. */
function readSitemapProductIds(): string[] {
  try {
    const ids = loadStoreProductIds();
    return Array.isArray(ids) ? ids.filter((id) => id.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/classes",
    "/contact",
    "/staff",
    "/store",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productIds = await Promise.resolve(readSitemapProductIds());
  const productRoutes = productIds.map((id) => ({
    url: `${siteUrl}/store/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const competitionRoutes = getCompetitionSlugs().map((slug) => ({
    url: `${siteUrl}/competitions/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...competitionRoutes];
}
