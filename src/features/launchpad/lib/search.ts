import type { ApplicationDefinition } from "@/types/application";

/**
 * Case-insensitive match on the registered name (whole or partial) and the app's keywords.
 * The input order is kept, so results never jump around while typing.
 */
export function filterApplications(
  apps: readonly ApplicationDefinition[],
  query: string,
): readonly ApplicationDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.id.includes(q) ||
      (app.searchKeywords ?? []).some((k) => k.toLowerCase().includes(q)),
  );
}
