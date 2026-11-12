import type { GitHubProfile, GitHubRepository } from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const iso = (v: unknown) => {
  const s = str(v);
  return s && !Number.isNaN(Date.parse(s)) ? new Date(s).toISOString() : null;
};

/** Only absolute https URLs; anything else is treated as "not provided". */
function httpsUrl(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * Validates one item from GitHub's API and turns it into the portfolio's own repository model.
 * Items that lack the essentials (id, name, GitHub URL) are dropped rather than repaired.
 */
export function normalizeRepository(raw: unknown): GitHubRepository | null {
  if (!isRecord(raw)) return null;
  const id = raw.id;
  const name = str(raw.name);
  const fullName = str(raw.full_name);
  const htmlUrl = httpsUrl(raw.html_url);
  const owner = isRecord(raw.owner) ? str(raw.owner.login) : null;
  const createdAt = iso(raw.created_at);
  const updatedAt = iso(raw.updated_at);
  if (typeof id !== "number" || !Number.isInteger(id) || !name || !fullName || !htmlUrl || !owner || !createdAt || !updatedAt) return null;
  // Repository links must stay on github.com.
  if (new URL(htmlUrl).hostname !== "github.com") return null;
  return {
    id,
    name,
    fullName,
    owner,
    description: str(raw.description),
    htmlUrl,
    homepageUrl: httpsUrl(raw.homepage),
    primaryLanguage: str(raw.language),
    topics: Array.isArray(raw.topics) ? raw.topics.filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 50).slice(0, 30) : [],
    stars: count(raw.stargazers_count),
    forks: count(raw.forks_count),
    isFork: raw.fork === true,
    isArchived: raw.archived === true,
    createdAt,
    updatedAt,
    pushedAt: iso(raw.pushed_at),
    defaultBranch: str(raw.default_branch) ?? "main",
  };
}

const AVATAR_HOST = "avatars.githubusercontent.com";

/**
 * Validates a GitHub user object. Only the account type "User" is accepted, text is length-limited, and the
 * avatar and profile links must be https on GitHub's own hosts; anything else is treated as not provided.
 */
export function normalizeProfile(raw: unknown): GitHubProfile | null {
  if (!isRecord(raw) || raw.type !== "User") return null;
  const login = str(raw.login);
  const htmlUrl = httpsUrl(raw.html_url);
  if (!login || !htmlUrl || new URL(htmlUrl).hostname !== "github.com") return null;
  const avatar = httpsUrl(raw.avatar_url);
  const avatarOk = avatar && new URL(avatar).protocol === "https:" && new URL(avatar).hostname === AVATAR_HOST;
  const cap = (v: unknown, n: number) => {
    const s = str(v);
    return s && s.length <= n ? s : null;
  };
  return { login, name: cap(raw.name, 100), bio: cap(raw.bio, 300), avatarUrl: avatarOk ? avatar : null, htmlUrl, publicRepos: count(raw.public_repos) };
}
