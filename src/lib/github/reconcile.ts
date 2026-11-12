import type { GitHubRepository } from "./types";

/**
 * Combines the repositories we already hold with a fresh fetch. Only a complete fetch may remove anything:
 * if the fetch was cut short (`truncated`), repositories that are missing from it are kept, because
 * "not returned" does not mean "deleted or made private". Repositories that are returned always win,
 * so renames and other metadata changes come through under the same numeric id.
 */
export function reconcileRepositories(
  previous: readonly GitHubRepository[],
  next: readonly GitHubRepository[],
  options: { complete: boolean },
): GitHubRepository[] {
  if (options.complete) return [...next];
  const returned = new Set(next.map((r) => r.id));
  return [...next, ...previous.filter((r) => !returned.has(r.id))];
}
