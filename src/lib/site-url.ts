/**
 * The public address of the deployed site, from the SITE_URL environment variable (server-side, read at build
 * time). Nothing is assumed: without it there is no canonical URL, no absolute Open Graph URL and no sitemap
 * link, rather than a guessed domain. Only an http(s) origin is accepted.
 */
export function getSiteUrl(): URL | undefined {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.username || url.password) return undefined;
    return new URL(url.origin);
  } catch {
    return undefined;
  }
}
