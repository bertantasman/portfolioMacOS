import type { PortfolioProject, ProjectScreenshot } from "@/types/project";
import type { ProjectChallenge, ProjectFeature, ProjectOutcome, ProjectTechnicalDetail, TechnologyCategory, ProjectPersonalStory, ProjectCaseStudy } from "@/types/project-content";
import { TECHNOLOGY_CATEGORIES } from "@/types/project-content";
import { getCategoryNames, getProjectCover, getProjectLinks, getProjectScreenshots, getStatusLabel, getValidUrl, splitParagraphs, type ProjectLink } from "./project-utils";

export interface TechnologyGroup {
  /** Null for technologies whose role isn't known: they are shown together, ungrouped. */
  label: string | null;
  items: string[];
}

export interface ProjectDetail {
  project: PortfolioProject;
  title: string;
  tagline?: string;
  categoryNames: string[];
  status?: { value: string; label: string };
  primaryTechnology?: string;
  links: ProjectLink[];
  cover?: ProjectScreenshot;
  overview: string[];
  problem: string[];
  solution: string[];
  features: ProjectFeature[];
  technologies: TechnologyGroup[];
  screenshots: ProjectScreenshot[];
  technicalDetails: readonly ProjectTechnicalDetail[];
  challenges: readonly ProjectChallenge[];
  responsibilities: readonly string[];
  outcomes: (ProjectOutcome & { evidenceUrl?: string })[];
  /** First-person context for projects that have verified personal significance; absent for all others. */
  personalStory?: ProjectPersonalStory;
  /** Case-study sections (experience, architecture, status…) for projects that have a written product story. */
  caseStudy?: ProjectCaseStudy;
}

const groupLabels: Record<TechnologyCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  infrastructure: "Infrastructure",
  tools: "Tools",
};

/** Curated technologies (grouped only where a role is given), else the project's own list; GitHub's language and topics fill in last. */
function technologyGroups(project: PortfolioProject): TechnologyGroup[] {
  const curated = project.content?.technologies;
  if (curated && curated.length > 0) {
    const groups: TechnologyGroup[] = TECHNOLOGY_CATEGORIES.flatMap((category) => {
      const items = curated.filter((t) => t.category === category).map((t) => t.name);
      return items.length > 0 ? [{ label: groupLabels[category], items }] : [];
    });
    const ungrouped = curated.filter((t) => !t.category || !TECHNOLOGY_CATEGORIES.includes(t.category)).map((t) => t.name);
    return ungrouped.length > 0 ? [...groups, { label: groups.length > 0 ? "Other" : null, items: ungrouped }] : groups;
  }
  const flat = [...new Set(project.technologies ?? [])];
  return flat.length > 0 ? [{ label: null, items: flat }] : [];
}

/**
 * Everything the Project Viewer shows for a project, resolved once with a fixed precedence: curated content,
 * then the project's own fields, then GitHub metadata. Anything not available is empty and its section is hidden.
 */
export function getProjectDetail(project: PortfolioProject): ProjectDetail {
  const c = project.content;
  const features: ProjectFeature[] = c?.features
    ? [...c.features]
    : (project.features ?? []).map((title, i) => ({ id: `f${i}`, title, description: "" }));
  const overview = splitParagraphs(c?.overview ?? project.longDescription);
  const technologies = technologyGroups(project);
  return {
    project,
    title: project.title,
    tagline: project.tagline,
    categoryNames: getCategoryNames(project),
    status: project.status ? { value: project.status, label: getStatusLabel(project.status) } : undefined,
    primaryTechnology: project.repository?.primaryLanguage ?? c?.technologies?.[0]?.name ?? technologies[0]?.items[0],
    links: getProjectLinks(project),
    cover: getProjectCover(project),
    // Without written content, the short description (curated, or GitHub's) stands in as the overview.
    overview: overview.length > 0 ? overview : project.shortDescription ? [project.shortDescription] : [],
    problem: splitParagraphs(c?.problem),
    solution: splitParagraphs(c?.solution),
    features,
    technologies,
    screenshots: getProjectScreenshots(project.id),
    technicalDetails: c?.technicalDetails ?? [],
    challenges: c?.challenges ?? [],
    responsibilities: c?.responsibilities ?? [],
    outcomes: (c?.outcomes ?? []).map((o) => ({ ...o, evidenceUrl: getValidUrl(o.evidenceUrl) })),
    caseStudy: c?.caseStudy,
    personalStory: c?.personalStory && c.personalStory.paragraphs.length > 0 ? c.personalStory : undefined,
  };
}
