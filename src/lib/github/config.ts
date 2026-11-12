import { siteConfig } from "@/config/site";

/** GitHub allows 1–39 letters, digits and single hyphens, not starting or ending with one. */
const USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export const isValidGitHubUsername = (value: string) => USERNAME.test(value);

/** The username from a profile URL such as https://github.com/octocat, if it is one. */
function usernameFromProfileUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") return undefined;
    return parsed.pathname.split("/").filter(Boolean)[0];
  } catch {
    return undefined;
  }
}

/**
 * The one place the GitHub account is configured: GITHUB_USERNAME, or else the GitHub profile URL in
 * siteConfig.profiles.github. Nothing is assumed when neither is set.
 */
export function getConfiguredUsername(): { username: string } | { username: null; reason: "not-configured" | "invalid-username" } {
  const raw = (process.env.GITHUB_USERNAME?.trim() || usernameFromProfileUrl(siteConfig.profiles.github) || "").trim();
  if (!raw) return { username: null, reason: "not-configured" };
  return isValidGitHubUsername(raw) ? { username: raw } : { username: null, reason: "invalid-username" };
}

/** Optional. Raises the API rate limit; used only on the server and never sent to the browser. */
export const getGitHubToken = () => process.env.GITHUB_TOKEN?.trim() || undefined;
