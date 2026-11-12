import type { ProjectContent } from "@/types/project-content";
import { curatedContent } from "./curated";
import { featuredProjectIds } from "./featured";

export { featuredProjectIds };

const byProject = new Map<string, ProjectContent>();
for (const entry of curatedContent) if (!byProject.has(entry.projectId)) byProject.set(entry.projectId, entry);

export const projectContent: readonly ProjectContent[] = curatedContent;
export const getProjectContent = (projectId: string): ProjectContent | undefined => byProject.get(projectId);

/** Position in the featured list (0 = first), or undefined when the project isn't listed. */
export const featuredIndex = (projectId: string): number | undefined => {
  const i = featuredProjectIds.indexOf(projectId);
  return i === -1 ? undefined : i;
};
