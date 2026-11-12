import type { GitHubRepository } from "@/lib/github/types";

/** A repository as the portfolio models it. Test data only. */
export function repo(id: number, name: string, extra: Partial<GitHubRepository> = {}): GitHubRepository {
  return {
    id,
    name,
    fullName: `octocat/${name}`,
    owner: "octocat",
    description: `${name} description`,
    htmlUrl: `https://github.com/octocat/${name}`,
    homepageUrl: null,
    primaryLanguage: "TypeScript",
    topics: [],
    stars: 0,
    forks: 0,
    isFork: false,
    isArchived: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
    pushedAt: "2024-06-01T00:00:00.000Z",
    defaultBranch: "main",
    ...extra,
  };
}

/** The same repository as GitHub's REST API sends it. */
export function apiRepo(id: number, name: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    name,
    full_name: `octocat/${name}`,
    owner: { login: "octocat" },
    description: `${name} description`,
    html_url: `https://github.com/octocat/${name}`,
    homepage: null,
    language: "TypeScript",
    topics: [],
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    archived: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    pushed_at: "2024-06-01T00:00:00Z",
    default_branch: "main",
    ...extra,
  };
}
