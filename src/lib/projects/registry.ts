import { projectCategories } from "@/data/project-categories";
import { repositoryOverrides, type RepositoryOverride } from "@/data/github-overrides";
import { projects as curatedProjects } from "@/data/projects";
import { featuredIndex, getProjectContent } from "@/data/project-content";
import { classifyRepository } from "@/lib/github/classify";
import type { GitHubRepository } from "@/lib/github/types";
import { useRepositoryStore } from "@/store/repository-store";
import type { PortfolioProject } from "@/types/project";

export interface ProjectRegistry {
  /** Curated projects first, then GitHub-backed ones. Forks are left out (see `all`). */
  projects: readonly PortfolioProject[];
  /** Everything above plus forked repositories. */
  all: readonly PortfolioProject[];
  byId: ReadonlyMap<string, PortfolioProject>;
  /** project id for each repository id, so a repository always maps to exactly one project. */
  projectIdByRepositoryId: ReadonlyMap<number, string>;
}

const lower = (s: string) => s.toLowerCase();

function repoFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return undefined;
    const [owner, name] = u.pathname.split("/").filter(Boolean);
    return owner && name ? `${owner}/${name.replace(/\.git$/, "")}` : undefined;
  } catch {
    return undefined;
  }
}

/** Whether the developer chose to leave this repository out of the portfolio entirely. */
export const isHiddenRepository = (repo: GitHubRepository) => findOverride(repo)?.hidden === true;

function findOverride(repo: GitHubRepository): RepositoryOverride | undefined {
  return repositoryOverrides.find((o) => (o.repositoryId !== undefined && o.repositoryId === repo.id) || (o.repositoryFullName && lower(o.repositoryFullName) === lower(repo.fullName)));
}

/** A project for a repository that has no hand-written entry. Only real GitHub data goes in. */
function projectFromRepository(repo: GitHubRepository, override: RepositoryOverride | undefined): PortfolioProject {
  const technologies = [...(repo.primaryLanguage ? [repo.primaryLanguage] : []), ...repo.topics];
  return {
    id: `github:${repo.id}`,
    slug: lower(repo.name),
    title: override?.displayName ?? repo.name,
    shortDescription: override?.customDescription ?? repo.description ?? "",
    categories: [override?.category ?? classifyRepository(repo)],
    technologies: technologies.length > 0 ? technologies : undefined,
    githubUrl: repo.htmlUrl,
    // The repository's homepage is not assumed to be a working demo; it is listed under Repository instead.
    startDate: repo.createdAt,
    featured: override?.featured,
    source: "github",
    repository: repo,
  };
}

/** A curated project keeps its own content; the repository adds links and facts it doesn't already have. */
function mergeCurated(curated: PortfolioProject, repo: GitHubRepository, override: RepositoryOverride | undefined): PortfolioProject {
  return {
    ...curated,
    githubUrl: curated.githubUrl ?? repo.htmlUrl,
    featured: override?.featured ?? curated.featured,
    source: "curated",
    repository: repo,
  };
}

/**
 * Layers curated content (and the featured list) over a project. Precedence: curated content, then the
 * project's own fields, then GitHub metadata. A repository that GitHub marks archived is shown as archived
 * unless the content says otherwise.
 */
function applyContent(project: PortfolioProject): PortfolioProject {
  const content = getProjectContent(project.id);
  const order = featuredIndex(project.id);
  const status = content?.developmentStatus ?? project.status ?? (project.repository?.isArchived ? ("archived" as const) : undefined);
  return {
    ...project,
    ...(content
      ? {
          content,
          title: content.displayName ?? project.title,
          tagline: content.tagline,
          shortDescription: content.tagline ?? project.shortDescription,
          // The overview is what search and other apps show as the longer description.
          longDescription: content.overview ?? project.longDescription,
          // Every app (Spotlight, widgets, Finder) reads the same technology list.
          technologies: content.technologies?.map((t) => t.name) ?? project.technologies,
        }
      : {}),
    featured: order !== undefined ? true : project.featured,
    featuredOrder: order,
    status,
  };
}

/**
 * A curated project belongs to a repository when it says so: by numeric id (survives renames), else by
 * "owner/name" or GitHub URL. Only a project with no explicit link at all falls back to its slug equalling
 * the repository name, so a stale or mistyped link never silently attaches to a different repository.
 */
export function matchesRepository(project: PortfolioProject, repo: GitHubRepository, link: string): boolean {
  if (project.githubRepositoryId !== undefined) return project.githubRepositoryId === repo.id;
  if (link !== "") return link === lower(repo.fullName);
  return lower(project.slug) === lower(repo.name);
}

const cache = new WeakMap<readonly GitHubRepository[], ProjectRegistry>();

/** Builds the one project list the whole portfolio reads. Cached per repository list, so it is cheap to ask for. */
export function deriveRegistry(repositories: readonly GitHubRepository[]): ProjectRegistry {
  const hit = cache.get(repositories);
  if (hit) return hit;

  // A curated project matches a repository by an explicit link, or else when its slug is the repository's name.
  const linkOf = (p: PortfolioProject) => lower(p.githubRepository ?? repoFromUrl(p.githubUrl) ?? "");
  const matched = new Map<string, PortfolioProject>();
  const mergedCurated = new Map<string, PortfolioProject>();
  const projectIdByRepositoryId = new Map<number, string>();
  const githubProjects: PortfolioProject[] = [];
  const hidden = new Set<number>();

  for (const repo of repositories) {
    const override = findOverride(repo);
    if (override?.hidden) {
      hidden.add(repo.id);
      continue;
    }
    const curated = curatedProjects.find((p) => !matched.has(p.id) && matchesRepository(p, repo, linkOf(p)));
    if (curated) {
      matched.set(curated.id, curated);
      mergedCurated.set(curated.id, mergeCurated(curated, repo, override));
      projectIdByRepositoryId.set(repo.id, curated.id);
    } else {
      const project = projectFromRepository(repo, override);
      githubProjects.push(project);
      projectIdByRepositoryId.set(repo.id, project.id);
    }
  }

  const curatedFinal = curatedProjects.map((p) => applyContent(mergedCurated.get(p.id) ?? { ...p, source: "curated" as const }));
  const byRecent = (a: PortfolioProject, b: PortfolioProject) => Date.parse(b.repository?.pushedAt ?? b.repository?.updatedAt ?? "0") - Date.parse(a.repository?.pushedAt ?? a.repository?.updatedAt ?? "0");
  const sortedGithub = githubProjects.map(applyContent).sort(byRecent);
  const all = [...curatedFinal, ...sortedGithub];
  const projects = all.filter((p) => !p.repository?.isFork || p.source === "curated" || p.featuredOrder !== undefined);
  const registry: ProjectRegistry = {
    projects,
    all,
    byId: new Map(all.map((p) => [p.id, p])),
    projectIdByRepositoryId,
  };
  cache.set(repositories, registry);
  return registry;
}

/** The registry for the repositories loaded so far (just the curated projects until GitHub answers). */
export const getRegistry = () => deriveRegistry(useRepositoryStore.getState().repositories);
export const getProjects = () => getRegistry().projects;
export const getProjectById = (id: string): PortfolioProject | undefined => getRegistry().byId.get(id);

/** React hook: re-renders when the repository list changes, and not otherwise. */
export function useProjectRegistry(): ProjectRegistry {
  return deriveRegistry(useRepositoryStore((s) => s.repositories));
}

const isShowcaseable = (p: PortfolioProject) => !p.repository || (!p.repository.isFork && !p.repository.isArchived);

/**
 * Projects to showcase. Configured ones (a `featured` flag on a curated project, or `featured: true` in an
 * override) come first. If none are configured, the fallback is clearly marked: curated projects, then
 * the most recently pushed original repositories. Stars are never used as a quality signal.
 */
export function selectFeatured(registry: ProjectRegistry, limit: number): { projects: PortfolioProject[]; configured: boolean } {
  // Explicit order first (the featured list), then the older flags in registry order.
  const configured = registry.projects
    .filter((p) => p.featured === true)
    .sort((a, b) => (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity));
  if (configured.length > 0) return { projects: configured.slice(0, limit), configured: true };
  return { projects: registry.projects.filter(isShowcaseable).slice(0, limit), configured: false };
}

export const categoryName = (id: string) => projectCategories.find((c) => c.id === id)?.name ?? id;
