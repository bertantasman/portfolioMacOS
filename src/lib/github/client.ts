import { getGitHubToken } from "./config";

const API_ORIGIN = "https://api.github.com";
/** Only these read-only endpoint families (a user's profile and repositories, a repository's README) are ever requested, whatever the caller passes. */
const ALLOWED_PATH = /^\/(users\/[A-Za-z0-9-]{1,39}(\/repos)?|repos\/[A-Za-z0-9._-]{1,100}\/[A-Za-z0-9._-]{1,100}\/readme)(\?[A-Za-z0-9_=&.-]*)?$/;

export interface GitHubResponse {
  status: number;
  headers: Headers;
  body: string;
}

/**
 * A GET to the official GitHub REST API. The URL is built here from a fixed origin and an allow-listed path,
 * so a visitor can never point it at another host. The token, when set, is sent as a header and never logged.
 */
export async function githubGet(path: string, options: { accept?: string; revalidate?: number } = {}): Promise<GitHubResponse> {
  if (!ALLOWED_PATH.test(path)) throw new Error("Blocked GitHub request");
  const url = new URL(path, API_ORIGIN);
  if (url.origin !== API_ORIGIN) throw new Error("Blocked GitHub request");

  const headers: Record<string, string> = {
    Accept: options.accept ?? "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "macos-portfolio",
  };
  const token = getGitHubToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    headers,
    // Next's data cache: the same request is reused for the revalidate window (default one hour).
    next: { revalidate: options.revalidate ?? 3600 },
    signal: AbortSignal.timeout(10_000),
  });
  return { status: response.status, headers: response.headers, body: await response.text() };
}

/** Seconds until the rate limit resets, when GitHub says it is exhausted. */
export function rateLimitWait(response: GitHubResponse): number | null {
  const limited =
    response.status === 429 || (response.status === 403 && (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")));
  if (!limited) return null;
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter;
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  return Number.isFinite(reset) && reset > 0 ? Math.max(1, Math.ceil(reset - Date.now() / 1000)) : 60;
}
