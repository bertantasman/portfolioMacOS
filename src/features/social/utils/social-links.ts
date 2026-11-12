import { profile, type SocialLinks } from "@/data/profile";
import { safeHttpUrl } from "@/lib/safe-url";

export type SocialPlatform = keyof SocialLinks;

const HOSTS: Record<SocialPlatform, readonly string[]> = {
  github: ["github.com", "www.github.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  instagram: ["instagram.com", "www.instagram.com"],
};

export interface ProfileLink {
  /** Validated http(s) URL, safe to use as an href. */
  url: string;
  /** Only set when the URL is on the platform's own domain, so it can be trusted. */
  username?: string;
}

/**
 * The visitor-facing link for a platform, from the central developer profile.
 * Undefined when nothing valid is configured. Usernames are derived from the
 * verified URL, never invented.
 */
export function getProfileLink(platform: SocialPlatform): ProfileLink | undefined {
  const url = safeHttpUrl(profile.socialLinks[platform]);
  if (!url) return undefined;
  const parsed = new URL(url);
  if (!HOSTS[platform].includes(parsed.hostname)) return { url };
  const segments = parsed.pathname.split("/").filter(Boolean);
  const name = platform === "linkedin" ? (segments[0] === "in" ? segments[1] : undefined) : segments[0];
  return { url, username: name };
}
