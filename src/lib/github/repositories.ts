import { githubGet, rateLimitWait } from "./client";
import { getConfiguredUsername } from "./config";
import { normalizeProfile, normalizeRepository } from "./normalize";
import { reconcileRepositories } from "./reconcile";
import type { GitHubProfile, GitHubRepository, ProfileResponse, ReadmeResponse, RepositoriesResponse } from "./types";

const PER_PAGE = 100;
/**
 * Safety limit: 10 pages × 100 = 1,000 repositories. If GitHub says there is more, the result is flagged
 * `truncated` instead of being passed off as complete.
 */
const MAX_PAGES = 10;
const FRESH_MS = 60 * 60_000;
/** A manual refresh may hit GitHub at most this often, whoever asks. */
const MIN_FORCE_GAP_MS = 60_000;
const README_MAX_CHARS = 200_000;

interface Cached {
  username: string;
  at: number;
  repositories: GitHubRepository[];
  truncated: boolean;
}

let cache: Cached | null = null;
let inflight: Promise<RepositoriesResponse> | null = null;
let rateLimitedUntil = 0;
let lastForce = 0;

const hasNext = (link: string | null) => !!link && /<[^>]+>;\s*rel="next"/.test(link);

async function loadFromGitHub(username: string): Promise<RepositoriesResponse> {
  const repositories: GitHubRepository[] = [];
  let truncated = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await githubGet(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=${PER_PAGE}&page=${page}`);

    const wait = rateLimitWait(response);
    if (wait !== null) {
      rateLimitedUntil = Date.now() + wait * 1000;
      return { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later.", retryAfterSeconds: wait };
    }
    if (response.status === 404) return { ok: false, reason: "not-found", message: `No GitHub user named “${username}” was found.` };
    if (response.status !== 200) return { ok: false, reason: "unavailable", message: "GitHub is not responding right now." };

    let items: unknown;
    try {
      items = JSON.parse(response.body);
    } catch {
      return { ok: false, reason: "unavailable", message: "GitHub sent a response that could not be read." };
    }
    if (!Array.isArray(items)) return { ok: false, reason: "unavailable", message: "GitHub sent an unexpected response." };

    for (const item of items) {
      const repo = normalizeRepository(item);
      if (repo) repositories.push(repo);
    }
    if (!hasNext(response.headers.get("link"))) break;
    if (page === MAX_PAGES) truncated = true;
  }

  // Stable order, and no duplicates if a page boundary shifted while paginating.
  const unique = [...new Map(repositories.map((r) => [r.id, r])).values()];
  return { ok: true, username, repositories: unique, fetchedAt: Date.now(), truncated, stale: false };
}

/**
 * The public repositories of the configured account, all pages. Results are kept for an hour; a failed
 * refresh falls back to the last good copy (marked stale), and rate limits are remembered so GitHub isn't hit again early.
 */
export async function getRepositories(options: { force?: boolean } = {}): Promise<RepositoriesResponse> {
  const configured = getConfiguredUsername();
  if (configured.username === null) {
    return {
      ok: false,
      reason: configured.reason,
      message:
        configured.reason === "not-configured"
          ? "No GitHub account is configured. Set GITHUB_USERNAME in .env.local (see .env.example)."
          : "The configured GitHub username isn’t valid.",
    };
  }
  const { username } = configured;
  const now = Date.now();
  const usable = cache && cache.username === username ? cache : null;

  const asResult = (c: Cached, stale: boolean): RepositoriesResponse => ({
    ok: true,
    username: c.username,
    repositories: c.repositories,
    fetchedAt: c.at,
    truncated: c.truncated,
    stale,
  });

  const forcing = options.force === true && now - lastForce >= MIN_FORCE_GAP_MS;
  if (usable && !forcing && now - usable.at < FRESH_MS) return asResult(usable, false);

  if (now < rateLimitedUntil) {
    if (usable) return asResult(usable, true);
    return { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later.", retryAfterSeconds: Math.ceil((rateLimitedUntil - now) / 1000) };
  }

  if (forcing) lastForce = now;
  // One request at a time, shared by everyone who asks meanwhile.
  inflight ??= loadFromGitHub(username)
    .catch((): RepositoriesResponse => ({ ok: false, reason: "unavailable", message: "GitHub could not be reached." }))
    .finally(() => {
      inflight = null;
    });
  const result = await inflight;

  if (result.ok) {
    // A truncated fetch never removes repositories we already know about.
    const repositories = reconcileRepositories(usable?.repositories ?? [], result.repositories, { complete: !result.truncated });
    cache = { username, at: result.fetchedAt, repositories, truncated: result.truncated };
    return { ...result, repositories };
  }
  // GitHub failed: keep showing what we last had rather than nothing.
  return usable ? asResult(usable, true) : result;
}

let profileCache: { username: string; at: number; profile: GitHubProfile } | null = null;
let profileInflight: Promise<ProfileResponse> | null = null;

/**
 * The configured account's public profile (name, bio, avatar, repository count), cached for an hour like the
 * repository list: one request at a time, the last good copy on failure, and rate limits remembered.
 */
export async function getProfile(): Promise<ProfileResponse> {
  const configured = getConfiguredUsername();
  if (configured.username === null) {
    return { ok: false, reason: configured.reason, message: configured.reason === "not-configured" ? "No GitHub account is configured." : "The configured GitHub username isn’t valid." };
  }
  const { username } = configured;
  const now = Date.now();
  const usable = profileCache && profileCache.username === username ? profileCache : null;
  const asOk = (c: NonNullable<typeof profileCache>, stale: boolean): ProfileResponse => ({ ok: true, profile: c.profile, fetchedAt: c.at, stale });
  if (usable && now - usable.at < FRESH_MS) return asOk(usable, false);
  if (now < rateLimitedUntil) return usable ? asOk(usable, true) : { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later." };

  profileInflight ??= (async (): Promise<ProfileResponse> => {
    const response = await githubGet(`/users/${encodeURIComponent(username)}`);
    const wait = rateLimitWait(response);
    if (wait !== null) {
      rateLimitedUntil = Date.now() + wait * 1000;
      return { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later." };
    }
    if (response.status === 404) return { ok: false, reason: "not-found", message: `No GitHub user named “${username}” was found.` };
    if (response.status !== 200) return { ok: false, reason: "unavailable", message: "GitHub is not responding right now." };
    let raw: unknown;
    try {
      raw = JSON.parse(response.body);
    } catch {
      return { ok: false, reason: "unavailable", message: "GitHub sent a response that could not be read." };
    }
    const profile = normalizeProfile(raw);
    return profile ? { ok: true, profile, fetchedAt: Date.now(), stale: false } : { ok: false, reason: "unavailable", message: "GitHub sent an unexpected response." };
  })()
    .catch((): ProfileResponse => ({ ok: false, reason: "unavailable", message: "GitHub could not be reached." }))
    .finally(() => {
      profileInflight = null;
    });
  const result = await profileInflight;
  if (result.ok) {
    profileCache = { username, at: result.fetchedAt, profile: result.profile };
    return result;
  }
  return usable ? asOk(usable, true) : result;
}

/** Clears the in-memory state. For tests only. */
export function resetGitHubStateForTests() {
  cache = null;
  inflight = null;
  rateLimitedUntil = 0;
  lastForce = 0;
  profileCache = null;
  profileInflight = null;
  readmeCache.clear();
}

const readmeCache = new Map<string, { at: number; value: ReadmeResponse }>();

/** The README of one of the account's own repositories (which must be in the repository list), cached for an hour. */
export async function getReadme(fullName: string): Promise<ReadmeResponse> {
  const list = await getRepositories();
  if (!list.ok) return { ok: false, reason: "unavailable", message: list.message };
  // Only repositories we already know are requested; the name never comes straight from the client.
  const repo = list.repositories.find((r) => r.fullName.toLowerCase() === fullName.toLowerCase());
  if (!repo) return { ok: false, reason: "not-found", message: "That repository isn’t part of this portfolio." };

  const hit = readmeCache.get(repo.fullName);
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.value;
  if (Date.now() < rateLimitedUntil) return hit?.value ?? { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later." };

  let value: ReadmeResponse;
  try {
    const response = await githubGet(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/readme`, { accept: "application/vnd.github.raw+json" });
    const wait = rateLimitWait(response);
    if (wait !== null) {
      rateLimitedUntil = Date.now() + wait * 1000;
      return hit?.value ?? { ok: false, reason: "rate-limited", message: "GitHub’s rate limit has been reached. Try again later." };
    }
    if (response.status === 404) value = { ok: false, reason: "no-readme", message: "This repository has no README." };
    else if (response.status !== 200) return hit?.value ?? { ok: false, reason: "unavailable", message: "The README could not be loaded." };
    else {
      const truncated = response.body.length > README_MAX_CHARS;
      value = { ok: true, markdown: truncated ? response.body.slice(0, README_MAX_CHARS) : response.body, truncated };
    }
  } catch {
    return hit?.value ?? { ok: false, reason: "unavailable", message: "The README could not be loaded." };
  }
  readmeCache.set(repo.fullName, { at: Date.now(), value });
  return value;
}
