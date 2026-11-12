/**
 * Navigation for the mobile shell as plain data: which app is in front, each app's screen stack (so reopening an
 * app resumes where it was), and the recent-apps list. No React, no browser APIs, so it is unit-tested directly.
 */
export const MAX_RECENTS = 8;

export interface NavState {
  /** The app in front, or null on the home screen. */
  active: string | null;
  /** Detail screens opened inside each app, oldest first (empty means the app's root screen). */
  stacks: Readonly<Record<string, readonly string[]>>;
  /** Most recently used first, capped at MAX_RECENTS. */
  recents: readonly string[];
}

export const initialNav: NavState = { active: null, stacks: {}, recents: [] };

const touch = (recents: readonly string[], app: string) => [app, ...recents.filter((r) => r !== app)].slice(0, MAX_RECENTS);

/** Brings an app to the front. `stack` replaces its saved screens (used by deep links); otherwise it resumes. */
export function launch(state: NavState, app: string, stack?: readonly string[]): NavState {
  return {
    active: app,
    stacks: stack ? { ...state.stacks, [app]: stack } : state.stacks,
    recents: touch(state.recents, app),
  };
}

/** Opens a detail screen in the front app. */
export function push(state: NavState, screen: string): NavState {
  if (!state.active) return state;
  const current = state.stacks[state.active] ?? [];
  if (current[current.length - 1] === screen) return state;
  return { ...state, stacks: { ...state.stacks, [state.active]: [...current, screen] } };
}

/** One step back: a detail screen closes, or the app's root goes home. */
export function back(state: NavState): NavState {
  if (!state.active) return state;
  const current = state.stacks[state.active] ?? [];
  if (current.length > 0) return { ...state, stacks: { ...state.stacks, [state.active]: current.slice(0, -1) } };
  return goHome(state);
}

/** The app stays in the recents with its screens; the home screen shows. */
export function goHome(state: NavState): NavState {
  return state.active === null ? state : { ...state, active: null };
}

/** Removes an app from the recents and forgets its screens (swiping a card away in the App Switcher). */
export function close(state: NavState, app: string): NavState {
  const { [app]: _dropped, ...stacks } = state.stacks;
  void _dropped;
  return { active: state.active === app ? null : state.active, stacks, recents: state.recents.filter((r) => r !== app) };
}

/** How many history entries the current position needs: one for the app, one per detail screen. */
export const depthOf = (state: NavState): number => (state.active ? 1 + (state.stacks[state.active]?.length ?? 0) : 0);

// ── Deep links: "#/projects/courtrise", "#/resume" ──────────────────────────────────────────────────────────────

export function formatHash(app: string | null, stack: readonly string[]): string {
  if (!app) return "";
  return `#/${[app, ...stack].map(encodeURIComponent).join("/")}`;
}

/** Parses a hash into an app and its screens. Unknown apps are rejected by the caller via `isKnownApp`. */
export function parseHash(hash: string, isKnownApp: (id: string) => boolean): { app: string; stack: string[] } | null {
  if (!hash.startsWith("#/")) return null;
  let parts: string[];
  try {
    parts = hash.slice(2).split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
  const [app, ...stack] = parts;
  if (!app || !isKnownApp(app) || stack.length > 6) return null;
  return { app, stack };
}
