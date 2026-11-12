import type { DeveloperStatistics, StatCategoryId } from "@/lib/projects/statistics";

/** What a visitor clicked on in the statistics: a category (iOS, UIKit…) or a technology (Python…). */
export type StatFocus = { kind: "category"; id: StatCategoryId } | { kind: "technology"; name: string };

export const sameFocus = (a: StatFocus | null, b: StatFocus | null) =>
  a === b || (a !== null && b !== null && a.kind === b.kind && (a.kind === "category" ? a.id === (b as typeof a).id : a.name === (b as typeof a).name));

/** Whether a project belongs to the focus. With no focus everything matches; unclassified projects never match one. */
export function matchesFocus(stats: DeveloperStatistics, projectId: string, focus: StatFocus | null): boolean {
  if (!focus) return true;
  const c = stats.byProject.get(projectId);
  if (!c) return false;
  return focus.kind === "category" ? c.categories.includes(focus.id) : c.technologies.includes(focus.name);
}
