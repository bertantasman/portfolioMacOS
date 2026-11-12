import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Indexing is intentional: the portfolio is public. The API routes are not for crawlers. */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    // A one-page site needs no sitemap; the robots file only points at one if it ever exists on a known domain.
    ...(site ? { host: site.origin } : {}),
  };
}
