import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cdf.studio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/lab/", "/api/", "/bag"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
