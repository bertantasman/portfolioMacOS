import { depthOf, formatHash, type NavState } from "./router";

/**
 * Keeps the browser's history in step with the app navigation: one entry for an app, one per detail screen, each tagged with
 * its depth. The store never reads the browser; it only tells this module where it was and where it is now.
 */
let ignore = 0;
let pendingHash: string | null = null;

const hashFor = (nav: NavState, depth: number) => (nav.active ? formatHash(nav.active, (nav.stacks[nav.active] ?? []).slice(0, depth - 1)) : "");
const url = (hash: string) => `${location.pathname}${location.search}${hash}`;

export function canUseHistory() {
  return typeof window !== "undefined" && typeof history !== "undefined";
}

/** Moves the browser history from `prevDepth` entries to the depth of `next`. Returns the new depth. */
export function syncHistory(prevDepth: number, next: NavState): number {
  if (!canUseHistory()) return depthOf(next);
  const target = depthOf(next);
  if (target > prevDepth) {
    for (let d = prevDepth + 1; d <= target; d++) history.pushState({ mobileDepth: d }, "", url(hashFor(next, d)));
  } else if (target < prevDepth) {
    ignore++;
    pendingHash = target > 0 ? hashFor(next, target) : null;
    history.go(target - prevDepth);
  } else if (target > 0) {
    history.replaceState({ mobileDepth: target }, "", url(hashFor(next, target)));
  }
  return target;
}

/** Forgets any hash in the address bar (a deep link was applied) and marks the entry as depth 0. */
export function resetBaseEntry() {
  if (canUseHistory()) history.replaceState({ mobileDepth: 0 }, "", url(""));
}

/**
 * Handles a popstate. Returns how many steps back the navigation should take, or 0 to do nothing. Our own `go()` calls are
 * recognised and ignored; a forward step is undone, because screens cannot be replayed from history.
 */
export function readPopState(event: PopStateEvent, currentDepth: number): number {
  if (ignore > 0) {
    ignore--;
    if (pendingHash !== null) history.replaceState({ mobileDepth: (event.state?.mobileDepth as number) ?? 0 }, "", url(pendingHash));
    pendingHash = null;
    return 0;
  }
  const target = typeof event.state?.mobileDepth === "number" ? (event.state.mobileDepth as number) : 0;
  if (target > currentDepth) {
    ignore++;
    history.go(currentDepth - target);
    return 0;
  }
  return currentDepth - target;
}
