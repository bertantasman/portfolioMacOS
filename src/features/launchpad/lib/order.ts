import type { ApplicationDefinition } from "@/types/application";

/**
 * Turns whatever was stored into a valid order for the current registry: known ids keep their
 * stored position (duplicates dropped), unknown ids are ignored, new apps are appended in
 * registry order. The registry is the source of truth; nothing here is hardcoded.
 */
export function resolveOrder(registryIds: readonly string[], stored: unknown): string[] {
  const known = new Set(registryIds);
  const seen = new Set<string>();
  const result: string[] = [];
  if (Array.isArray(stored)) {
    for (const id of stored) {
      if (typeof id === "string" && known.has(id) && !seen.has(id)) {
        seen.add(id);
        result.push(id);
      }
    }
  }
  for (const id of registryIds) if (!seen.has(id)) result.push(id);
  return result;
}

export function orderApplications(
  apps: readonly ApplicationDefinition[],
  stored: unknown,
): ApplicationDefinition[] {
  const byId = new Map(apps.map((a) => [a.id as string, a]));
  return resolveOrder(
    apps.map((a) => a.id),
    stored,
  ).map((id) => byId.get(id)!);
}

/** A copy of `list` with the item at `from` moved to `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}
