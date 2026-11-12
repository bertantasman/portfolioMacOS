import { projectAnalysis } from "@/data/project-content/analysis";
import type { GitHubRepository } from "@/lib/github/types";
import type { ProjectAnalysis, ProjectArea, ProjectFramework, ProjectPlatform } from "@/types/project-analysis";
import { deriveRegistry, type ProjectRegistry } from "./registry";

/**
 * Developer statistics, calculated from the project registry and the verified analysis records. Nothing here
 * is typed in: add or change a repository and the numbers follow. Rules (also in docs/DEVELOPER_STATISTICS.md):
 *  - Scope is the account's public GitHub repositories, counted once each by numeric repository id.
 *  - A project is counted when it has an analysis record and is not a fork, empty, or not a project.
 *  - A repository without an analysis record is "pending classification": it is never guessed at and never counted.
 *  - Categories overlap on purpose (an iOS app using UIKit is in both), so they do not add up to the total.
 */

export type StatCategoryId = "ios" | "android" | "web" | "backend" | "desktop" | "cross-platform" | "ai" | "uikit" | "swiftui" | "flutter" | "react" | "nextjs";

export interface StatCategory {
  id: StatCategoryId;
  group: "platform" | "framework" | "area";
  /** Recruiter-friendly label for statistic cards and filters. */
  label: string;
  /** Short label for small tags on project cards. */
  tag: string;
  matches: (c: Pick<ProjectClassification, "platforms" | "frameworks" | "areas">) => boolean;
}

const hasPlatform = (p: ProjectPlatform) => (c: Pick<ProjectClassification, "platforms">) => c.platforms.includes(p);
const hasFramework = (f: ProjectFramework) => (c: Pick<ProjectClassification, "frameworks">) => c.frameworks.includes(f);
const AI_AREAS: readonly ProjectArea[] = ["machine-learning", "computer-vision", "nlp"];

/** In display order. */
export const STAT_CATEGORIES: readonly StatCategory[] = [
  { id: "ios", group: "platform", label: "iOS Applications", tag: "iOS", matches: hasPlatform("ios") },
  { id: "android", group: "platform", label: "Android Applications", tag: "Android", matches: hasPlatform("android") },
  { id: "web", group: "platform", label: "Web Projects", tag: "Web", matches: hasPlatform("web") },
  { id: "backend", group: "platform", label: "Backend Projects", tag: "Backend", matches: hasPlatform("backend") },
  { id: "desktop", group: "platform", label: "Desktop Programs", tag: "Desktop", matches: hasPlatform("desktop") },
  { id: "cross-platform", group: "platform", label: "Cross-Platform Apps", tag: "Cross-platform", matches: hasPlatform("cross-platform") },
  { id: "ai", group: "area", label: "AI / ML Projects", tag: "AI / ML", matches: (c) => c.areas.some((a) => AI_AREAS.includes(a)) },
  { id: "swiftui", group: "framework", label: "Projects Using SwiftUI", tag: "SwiftUI", matches: hasFramework("swiftui") },
  { id: "uikit", group: "framework", label: "Projects Using UIKit", tag: "UIKit", matches: hasFramework("uikit") },
  { id: "flutter", group: "framework", label: "Projects Using Flutter", tag: "Flutter", matches: hasFramework("flutter") },
  { id: "react", group: "framework", label: "Projects Using React", tag: "React", matches: hasFramework("react") },
  { id: "nextjs", group: "framework", label: "Projects Using Next.js", tag: "Next.js", matches: hasFramework("nextjs") },
];

export const getStatCategory = (id: string) => STAT_CATEGORIES.find((c) => c.id === id);

/** Different spellings of one technology count once. */
const TECHNOLOGY_ALIASES: Record<string, string> = {
  "firebase authentication": "Firebase",
  "cloud firestore": "Firebase",
  "firebase storage": "Firebase",
};
export const canonicalTechnology = (name: string) => TECHNOLOGY_ALIASES[name.trim().toLowerCase()] ?? name.trim();

export interface ProjectClassification {
  projectId: string;
  repositoryId: number;
  repositoryName: string;
  platforms: readonly ProjectPlatform[];
  frameworks: readonly ProjectFramework[];
  areas: readonly ProjectArea[];
  /** Canonical technology names from the written project content. */
  technologies: readonly string[];
  categories: readonly StatCategoryId[];
  confidence: ProjectAnalysis["classificationConfidence"];
  notes: readonly string[];
}

export interface ScopeEntry {
  repositoryId: number;
  name: string;
}
export interface ExcludedEntry extends ScopeEntry {
  reason: string;
}

export interface DeveloperStatistics {
  scope: {
    /** Public repositories of the account (each counted once). */
    repositoriesInScope: number;
    /** Repositories that have an analysis record. */
    analyzed: number;
    /** Repositories counted as projects. */
    counted: number;
    /** Repositories with no analysis yet: not classified, not counted. */
    pending: readonly ScopeEntry[];
    excluded: readonly ExcludedEntry[];
    /** Counted projects whose classification is not high-confidence, or carries notes to review. */
    needsReview: readonly ScopeEntry[];
  };
  totalProjects: number;
  iosProjects: number;
  swiftUIProjects: number;
  uiKitProjects: number;
  androidProjects: number;
  flutterProjects: number;
  webProjects: number;
  backendProjects: number;
  aiProjects: number;
  categoryCounts: Readonly<Record<StatCategoryId, number>>;
  projectsByCategory: Readonly<Record<StatCategoryId, readonly string[]>>;
  /** Technologies actually named in the counted projects, most used first (ties alphabetical). */
  technologies: readonly { name: string; count: number; projectIds: readonly string[] }[];
  technologyCounts: Readonly<Record<string, number>>;
  byProject: ReadonlyMap<string, ProjectClassification>;
}

export function computeStatistics(
  repositories: readonly GitHubRepository[],
  registry: ProjectRegistry,
  analyses: readonly ProjectAnalysis[] = projectAnalysis,
): DeveloperStatistics {
  const analysisByRepo = new Map(analyses.map((a) => [Number(a.projectId.replace(/^github:/, "")), a]));
  // The same repository id never counts twice, whatever the list contains.
  const unique = [...new Map(repositories.map((r) => [r.id, r])).values()];

  const pending: ScopeEntry[] = [];
  const excluded: ExcludedEntry[] = [];
  const needsReview: ScopeEntry[] = [];
  const classified: ProjectClassification[] = [];
  let analyzed = 0;

  for (const repo of unique) {
    const entry = { repositoryId: repo.id, name: repo.name };
    const projectId = registry.projectIdByRepositoryId.get(repo.id);
    const analysis = analysisByRepo.get(repo.id);
    if (analysis) analyzed++;
    // The reason a repository is left out is the most specific one known, whether or not it is also hidden.
    if (repo.isFork) {
      excluded.push({ ...entry, reason: "Fork of another developer's project" });
      continue;
    }
    if (analysis && (analysis.projectType === "empty" || analysis.projectType === "not-a-project")) {
      excluded.push({ ...entry, reason: analysis.projectType === "empty" ? "Empty repository" : "Not a project" });
      continue;
    }
    if (!projectId) {
      excluded.push({ ...entry, reason: "Hidden from the portfolio" });
      continue;
    }
    if (!analysis) {
      pending.push(entry);
      continue;
    }
    // Only technologies named in the verified written content count. The registry's fallback to GitHub's
    // primary language and topics is a display convenience, not evidence, so it is deliberately not used here.
    const technologies = [...new Set((registry.byId.get(projectId)?.content?.technologies ?? []).map((t) => canonicalTechnology(t.name)))];
    const base = { platforms: analysis.platforms, frameworks: analysis.frameworks, areas: analysis.areas };
    classified.push({
      projectId,
      repositoryId: repo.id,
      repositoryName: repo.name,
      ...base,
      technologies,
      categories: STAT_CATEGORIES.filter((c) => c.matches(base)).map((c) => c.id),
      confidence: analysis.classificationConfidence,
      notes: analysis.classificationNotes,
    });
    if (analysis.classificationConfidence !== "high" || analysis.classificationNotes.length > 0) needsReview.push(entry);
  }

  const projectsByCategory = Object.fromEntries(STAT_CATEGORIES.map((c) => [c.id, classified.filter((p) => p.categories.includes(c.id)).map((p) => p.projectId)])) as Record<StatCategoryId, string[]>;
  const categoryCounts = Object.fromEntries(STAT_CATEGORIES.map((c) => [c.id, projectsByCategory[c.id].length])) as Record<StatCategoryId, number>;

  const byTech = new Map<string, string[]>();
  for (const p of classified) for (const t of p.technologies) byTech.set(t, [...(byTech.get(t) ?? []), p.projectId]);
  const technologies = [...byTech.entries()]
    .map(([name, projectIds]) => ({ name, count: projectIds.length, projectIds }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    scope: { repositoriesInScope: unique.length, analyzed, counted: classified.length, pending, excluded, needsReview },
    totalProjects: classified.length,
    iosProjects: categoryCounts.ios,
    swiftUIProjects: categoryCounts.swiftui,
    uiKitProjects: categoryCounts.uikit,
    androidProjects: categoryCounts.android,
    flutterProjects: categoryCounts.flutter,
    webProjects: categoryCounts.web,
    backendProjects: categoryCounts.backend,
    aiProjects: categoryCounts.ai,
    categoryCounts,
    projectsByCategory,
    technologies,
    technologyCounts: Object.fromEntries(technologies.map((t) => [t.name, t.count])),
    byProject: new Map(classified.map((p) => [p.projectId, p])),
  };
}

const AREA_WORDS: Record<ProjectArea, string> = {
  "computer-vision": "computer vision",
  "image-processing": "image processing",
  "machine-learning": "machine learning",
  nlp: "NLP",
  "distributed-systems": "distributed systems",
};

/** Words that should find a project in search: its verified categories, tags and fields (never anything unverified). */
export function classificationKeywords(c: ProjectClassification): string[] {
  const cats = c.categories.map((id) => getStatCategory(id)).filter((x): x is StatCategory => x !== undefined);
  const ai = c.categories.includes("ai") ? ["AI", "ML", "artificial intelligence"] : [];
  return [...new Set([...cats.flatMap((x) => [x.tag, x.label]), ...c.areas.map((a) => AREA_WORDS[a]), ...ai])];
}

const cache = new WeakMap<readonly GitHubRepository[], DeveloperStatistics>();

/** Statistics for a repository list, computed once per list (the registry is cached the same way). */
export function getDeveloperStatistics(repositories: readonly GitHubRepository[]): DeveloperStatistics {
  const hit = cache.get(repositories);
  if (hit) return hit;
  const stats = computeStatistics(repositories, deriveRegistry(repositories));
  cache.set(repositories, stats);
  return stats;
}
