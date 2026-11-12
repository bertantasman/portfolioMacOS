/** A public repository, reduced to the fields the portfolio uses. Built from the GitHub REST API, never invented. */
export interface GitHubRepository {
  /** GitHub's numeric id. It survives renames, so it is the stable identity. */
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  homepageUrl: string | null;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  defaultBranch: string;
}

/** The account's public profile, reduced to what the portfolio shows. Counts such as followers are deliberately left out. */
export interface GitHubProfile {
  login: string;
  /** The display name the owner set on GitHub. */
  name: string | null;
  bio: string | null;
  /** An https image on GitHub's avatar host. */
  avatarUrl: string | null;
  htmlUrl: string;
  /** GitHub's own count of public repositories (before any portfolio-side hiding). */
  publicRepos: number;
}

export type ProfileResponse =
  | { ok: true; profile: GitHubProfile; fetchedAt: number; stale: boolean }
  | { ok: false; reason: GitHubFailure; message: string };

export type GitHubFailure =
  | "not-configured" // no GITHUB_USERNAME
  | "invalid-username"
  | "not-found"
  | "rate-limited"
  | "unavailable";

export type RepositoriesResponse =
  | {
      ok: true;
      username: string;
      repositories: GitHubRepository[];
      /** When the data was fetched from GitHub (ms since epoch). */
      fetchedAt: number;
      /** True when the safety limit stopped pagination, so the list may be incomplete. */
      truncated: boolean;
      /** True when GitHub couldn't be reached and the last good copy is being shown. */
      stale: boolean;
    }
  | { ok: false; reason: GitHubFailure; message: string; retryAfterSeconds?: number };

export type ReadmeResponse =
  | { ok: true; markdown: string; truncated: boolean }
  | { ok: false; reason: "no-readme" | "not-found" | "rate-limited" | "unavailable"; message: string };
