import type { PortfolioDocument } from "@/data/documents";
import { isSafeDocumentPath } from "@/data/documents";
import type { DeveloperProfile } from "@/data/profile";
import { validateProfile } from "@/lib/profile/validate";
import type { ProjectRegistry } from "@/lib/projects/registry";
import { safeHttpUrl } from "@/lib/safe-url";
import type { PortfolioMedia } from "@/types/media";
import type { PortfolioProject } from "@/types/project";

/**
 * A developer-facing check of the portfolio's content: what is missing, broken or duplicated. Everything is
 * computed from the real data passed in; nothing is estimated. It never changes anything.
 */

export type AuditSeverity = "error" | "warning";

export interface AuditIssue {
  severity: AuditSeverity;
  message: string;
}

export interface AuditInput {
  registry: ProjectRegistry;
  /** The hand-written projects (data/projects.ts), before GitHub data is merged in. */
  curated: readonly PortfolioProject[];
  profile: DeveloperProfile;
  media: readonly PortfolioMedia[];
  documents: readonly PortfolioDocument[];
  /** Messages from validateProjectContent: content, featured list and media references. */
  contentProblems?: readonly string[];
  /** Whether a file under /public exists. Omit when it can't be checked (e.g. in the browser). */
  fileExists?: (publicPath: string) => boolean;
  /** Whether GitHub data has been loaded. Without it, GitHub-backed references can't be judged. */
  repositoriesLoaded?: boolean;
}

export interface ContentAudit {
  counts: {
    githubRepositories: number;
    curatedProjects: number;
    visibleProjects: number;
    featuredProjects: number;
    mediaItems: number;
  };
  issues: AuditIssue[];
}

const URL_FIELDS = ["githubUrl", "liveUrl", "appStoreUrl", "playStoreUrl", "documentationUrl"] as const;
const SOCIAL = ["github", "linkedin", "instagram"] as const;

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) (seen.has(v) ? dup : seen).add(v);
  return [...dup];
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function buildContentAudit(input: AuditInput): ContentAudit {
  const { registry, curated, profile, media, documents } = input;
  const issues: AuditIssue[] = [];
  const error = (message: string) => issues.push({ severity: "error", message });
  const warn = (message: string) => issues.push({ severity: "warning", message });

  // Identity
  for (const id of duplicates(curated.map((p) => p.id))) error(`Duplicate project id "${id}" in data/projects.ts.`);
  for (const slug of duplicates(curated.map((p) => p.slug))) error(`Duplicate project slug "${slug}" in data/projects.ts.`);
  for (const id of duplicates(media.map((m) => m.id))) error(`Duplicate media id "${id}".`);
  for (const id of duplicates(documents.map((d) => d.id))) error(`Duplicate document id "${id}".`);

  // URLs on curated projects
  for (const p of curated) {
    for (const field of URL_FIELDS) {
      const value = p[field];
      if (value !== undefined && !safeHttpUrl(value)) error(`Project "${p.id}": ${field} "${value}" is not a valid URL.`);
      else if (value !== undefined && new URL(value).protocol !== "https:") warn(`Project "${p.id}": ${field} is not https.`);
    }
  }

  // Media references
  for (const m of media) {
    if (m.projectId && !registry.byId.has(m.projectId)) {
      // A GitHub-backed project can only be judged once GitHub data has loaded.
      if (!m.projectId.startsWith("github:") || input.repositoriesLoaded) error(`Media "${m.id}" references unknown project "${m.projectId}".`);
    }
    if (input.fileExists && !input.fileExists(m.src)) error(`Media "${m.id}": file ${m.src} does not exist under public/.`);
  }

  // Project content
  const mediaByProject = new Set(media.flatMap((m) => (m.projectId ? [m.projectId] : [])));
  const noDescription = registry.projects.filter((p) => !p.shortDescription.trim());
  const noScreenshots = registry.projects.filter((p) => !mediaByProject.has(p.id));
  if (noDescription.length > 0) warn(`${plural(noDescription.length, "project has", "projects have")} no description: ${noDescription.slice(0, 5).map((p) => p.title).join(", ")}${noDescription.length > 5 ? ", …" : ""}.`);
  if (noScreenshots.length > 0) warn(`${plural(noScreenshots.length, "project has", "projects have")} no screenshots.`);
  for (const problem of input.contentProblems ?? []) error(problem);

  // Possible duplicates: a GitHub-backed project that looks like a curated one but was not linked to it.
  const curatedTitles = new Map(curated.map((p) => [p.title.toLowerCase(), p.id]));
  for (const p of registry.all) {
    if (p.source !== "github") continue;
    const twin = curatedTitles.get(p.title.toLowerCase());
    if (twin) warn(`"${p.title}" is both a curated project (${twin}) and a separate GitHub project (${p.id}). Link them with githubRepositoryId in data/projects.ts if they are the same.`);
  }
  // A curated link that no loaded repository answered to (renamed, made private, or mistyped).
  if (input.repositoriesLoaded) {
    for (const p of curated) {
      if ((p.githubRepository || p.githubRepositoryId !== undefined) && !registry.byId.get(p.id)?.repository) {
        warn(`Curated project "${p.id}" points at a GitHub repository that was not found (renamed, private or mistyped).`);
      }
    }
  }

  // Profile and resume
  const known = new Set(registry.all.map((p) => p.id));
  for (const i of validateProfile(profile, input.repositoriesLoaded ? known : new Set([...known].filter((id) => !id.startsWith("github:"))))) {
    issues.push({ severity: "error", message: `Profile ${i.path}: ${i.message}` });
  }
  for (const platform of SOCIAL) if (!profile.socialLinks[platform]) warn(`No ${platform} profile URL is configured.`);
  if (!profile.email) warn("No contact email is configured.");
  for (const d of documents) {
    if (!isSafeDocumentPath(d.src)) error(`Document "${d.id}" has an unsafe path "${d.src}".`);
    else if (input.fileExists && !input.fileExists(d.src)) warn(`Document "${d.id}": file ${d.src} is missing.`);
  }
  if (!profile.resume) warn("No resume is configured in the profile.");

  return {
    counts: {
      githubRepositories: registry.projectIdByRepositoryId.size,
      curatedProjects: curated.length,
      visibleProjects: registry.projects.length,
      featuredProjects: registry.projects.filter((p) => p.featured === true).length,
      mediaItems: media.length,
    },
    issues,
  };
}

export function formatContentAudit(audit: ContentAudit): string {
  const { counts, issues } = audit;
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  return [
    "Portfolio Content Audit",
    "Projects:",
    `- ${plural(counts.githubRepositories, "GitHub repository", "GitHub repositories")}`,
    `- ${plural(counts.curatedProjects, "curated project")}`,
    `- ${plural(counts.visibleProjects, "visible project")}`,
    `- ${plural(counts.featuredProjects, "featured project")}`,
    `- ${plural(counts.mediaItems, "media item")}`,
    ...(errors.length ? ["Errors:", ...errors.map((i) => `- ${i.message}`)] : []),
    ...(warnings.length ? ["Warnings:", ...warnings.map((i) => `- ${i.message}`)] : []),
    ...(issues.length === 0 ? ["No issues found."] : []),
  ].join("\n");
}
