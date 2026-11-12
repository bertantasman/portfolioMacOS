import { DISPLAY_LOCALE } from "@/config/locale";
import { projectCategories } from "@/data/project-categories";
import { getMediaById, getMediaByProjectId } from "@/data/media";
import type { PortfolioProject, ProjectScreenshot, ProjectStatus } from "@/types/project";

export type ProjectLinkKind = "github" | "live" | "appStore" | "playStore" | "documentation" | "video";

export interface ProjectLink {
  kind: ProjectLinkKind;
  label: string;
  url: string;
}

/** Returns the normalised URL only for well-formed https addresses; every other scheme is rejected. */
export function getValidUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Only links that are configured and valid; never placeholders. Curated content wins, then the project's own
 * fields, then the repository's GitHub address. A repository homepage is never assumed to be a live demo.
 */
export function getProjectLinks(project: PortfolioProject): ProjectLink[] {
  const c = project.content?.links;
  const candidates: { kind: ProjectLinkKind; label: string; value: string | undefined }[] = [
    { kind: "github", label: "Open on GitHub", value: c?.github ?? project.githubUrl ?? project.repository?.htmlUrl },
    { kind: "live", label: "Live Demo", value: c?.liveDemo ?? project.liveUrl },
    { kind: "appStore", label: "View on the App Store", value: c?.appStore ?? project.appStoreUrl },
    { kind: "playStore", label: "Google Play", value: c?.googlePlay ?? project.playStoreUrl },
    { kind: "documentation", label: "Documentation", value: c?.documentation ?? project.documentationUrl },
    { kind: "video", label: "Video Demo", value: c?.videoDemo },
  ];
  return candidates.flatMap(({ kind, label, value }) => {
    const url = getValidUrl(value);
    return url ? [{ kind, label, url }] : [];
  });
}

export function getCategoryNames(project: PortfolioProject): string[] {
  return project.categories.map((id) => projectCategories.find((c) => c.id === id)?.name ?? id);
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-development": "In Development",
  prototype: "Playable Prototype",
  published: "Published on the App Store",
  completed: "Completed",
  maintained: "Maintained",
  archived: "Archived",
};

export const getStatusLabel = (status: ProjectStatus) => statusLabels[status];

const monthFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "long", year: "numeric" });

export function formatProjectDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? undefined : monthFormatter.format(new Date(time));
}

export interface MetadataRow {
  label: string;
  value: string;
}

/** Rows for values that exist; missing data is omitted, never filled in. */
export function getProjectMetadata(project: PortfolioProject): MetadataRow[] {
  const rows: MetadataRow[] = [];
  if (project.status) rows.push({ label: "Status", value: getStatusLabel(project.status) });

  const start = formatProjectDate(project.startDate);
  const end = formatProjectDate(project.endDate);
  if (start) rows.push({ label: "Started", value: start });
  if (end) rows.push({ label: "Finished", value: end });
  else if (start && project.status === "in-development") rows.push({ label: "Finished", value: "Ongoing" });

  if (project.categories.length > 0) {
    const provisional = project.provisional?.includes("categories") ? " (provisional)" : "";
    rows.push({
      label: project.categories.length > 1 ? "Categories" : "Category",
      value: getCategoryNames(project).join(", ") + provisional,
    });
  }
  return rows;
}

export const splitParagraphs = (text: string | undefined): string[] =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Screenshots come from the shared media library, not from the project record. */
export function getProjectScreenshots(projectId: string): ProjectScreenshot[] {
  return getMediaByProjectId(projectId).map((m) => ({
    mediaId: m.id,
    src: m.src,
    width: m.width,
    height: m.height,
    alt: m.alt,
    caption: m.description,
  }));
}

/** The cover: the curated cover image, else the project's first screenshot, else none (no placeholder art is invented). */
export function getProjectCover(project: PortfolioProject): ProjectScreenshot | undefined {
  const coverId = project.content?.coverMediaId;
  const cover = coverId ? getMediaById(coverId) : undefined;
  if (cover) return { mediaId: cover.id, src: cover.src, width: cover.width, height: cover.height, alt: cover.alt, caption: cover.description };
  return getProjectScreenshots(project.id)[0];
}
