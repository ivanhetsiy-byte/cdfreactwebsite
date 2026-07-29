import type { MetadataRoute } from "next";

import { getStoreProductIds } from "@/lib/store-products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cdf.studio";

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

  return [...staticRoutes, ...productRoutes];
}
