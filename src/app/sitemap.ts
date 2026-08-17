import type { MetadataRoute } from "next";

import { getCompetitionSlugs } from "@/lib/competitions";
import { SITE_URL } from "@/lib/site-links";
import { getStoreProductIds } from "@/lib/store-products";

const siteUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = getStoreProductIds().map((id) => ({
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
