import { getMediaById, getMediaByProjectId } from "@/data/media";
import { featuredProjectIds, projectContent } from "@/data/project-content";
import { getValidUrl } from "@/features/project-viewer/utils/project-utils";
import { PROJECT_STATUSES, TECHNOLOGY_CATEGORIES } from "@/types/project-content";
import type { ProjectRegistry } from "./registry";

/**
 * Checks the curated content for mistakes a developer can fix: unknown project ids, duplicate entries, bad
 * statuses or technology categories, unsafe URLs, and media ids that don't exist. Returns readable messages.
 */
export function validateProjectContent(registry: ProjectRegistry): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const mediaSeen = new Set<string>();
  const checkUrl = (where: string, value: string | undefined) => {
    if (value !== undefined && getValidUrl(value) === undefined) problems.push(`${where}: "${value}" is not a valid https URL.`);
  };
  const checkMedia = (where: string, id: string | undefined) => {
    if (!id) return;
    if (!getMediaById(id)) problems.push(`${where}: media "${id}" is not in the media library (src/data/media.ts).`);
    if (mediaSeen.has(`${where}\u0000${id}`)) problems.push(`${where}: media "${id}" is listed twice.`);
    mediaSeen.add(`${where}\u0000${id}`);
  };

  for (const c of projectContent) {
    const where = `Content "${c.projectId}"`;
    if (seen.has(c.projectId)) problems.push(`${where}: more than one entry for this project.`);
    seen.add(c.projectId);
    // GitHub-backed projects only exist once the repositories have loaded, so only curated ids are checked here.
    if (!c.projectId.startsWith("github:") && !registry.byId.has(c.projectId)) problems.push(`${where}: no project has this id.`);
    if (c.developmentStatus && !PROJECT_STATUSES.includes(c.developmentStatus)) problems.push(`${where}: unknown status "${c.developmentStatus}".`);
    for (const t of c.technologies ?? []) if (t.category && !TECHNOLOGY_CATEGORIES.includes(t.category)) problems.push(`${where}: technology "${t.name}" has unknown category "${t.category}".`);
    const featureIds = new Set<string>();
    for (const f of c.features ?? []) {
      if (featureIds.has(f.id)) problems.push(`${where}: feature id "${f.id}" is used twice.`);
      featureIds.add(f.id);
      checkMedia(`${where} feature "${f.id}"`, f.mediaId);
    }
    checkMedia(`${where} cover`, c.coverMediaId);
    for (const [key, value] of Object.entries(c.links ?? {})) checkUrl(`${where} link "${key}"`, value);
    for (const o of c.outcomes ?? []) checkUrl(`${where} outcome "${o.label}"`, o.evidenceUrl);
  }
  const featured = new Set<string>();
  for (const id of featuredProjectIds) {
    if (featured.has(id)) problems.push(`Featured list: "${id}" appears twice.`);
    featured.add(id);
    if (!id.startsWith("github:") && !registry.byId.has(id)) problems.push(`Featured list: no project has the id "${id}".`);
  }
  return problems;
}

export interface ContentReportEntry {
  projectId: string;
  title: string;
  available: string[];
  missing: string[];
}

/**
 * A maintenance report of what each project has and lacks, from real data only. It is for the developer
 * (see the console in development), and is never shown to visitors. README presence isn't checked here,
 * because READMEs are only fetched when a project is opened.
 */
export function getContentReport(registry: ProjectRegistry): ContentReportEntry[] {
  return registry.projects.map((p) => {
    const hasLink = (value: string | undefined) => getValidUrl(value) !== undefined;
    const checks: [string, boolean][] = [
      ["GitHub URL", hasLink(p.content?.links?.github ?? p.githubUrl ?? p.repository?.htmlUrl)],
      ["Description", Boolean(p.shortDescription)],
      ["Primary language", Boolean(p.repository?.primaryLanguage)],
      ["Detailed overview", Boolean(p.content?.overview ?? p.longDescription)],
      ["Technologies", Boolean(p.content?.technologies?.length || p.technologies?.length)],
      ["Cover image", Boolean(p.content?.coverMediaId)],
      ["Screenshots", Boolean(getMediaCount(p.id))],
      ["Demo URL", hasLink(p.content?.links?.liveDemo ?? p.liveUrl)],
    ];
    return {
      projectId: p.id,
      title: p.title,
      available: checks.filter(([, ok]) => ok).map(([name]) => name),
      missing: checks.filter(([, ok]) => !ok).map(([name]) => name),
    };
  });
}

const getMediaCount = (projectId: string) => getMediaByProjectId(projectId).length;

export function formatContentReport(entries: readonly ContentReportEntry[]): string {
  return entries
    .map((e) => `Project: ${e.title} (${e.projectId})\nAvailable:\n${e.available.map((a) => `- ${a}`).join("\n") || "- (nothing yet)"}\nMissing:\n${e.missing.map((m) => `- ${m}`).join("\n") || "- (nothing)"}`)
    .join("\n\n");
}
