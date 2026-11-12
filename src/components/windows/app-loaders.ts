import type { ApplicationId } from "@/types/application";

/**
 * Each application's code, loaded the first time a window needs it. The shell (desktop, menu bar, Dock,
 * window manager) is the only thing in the initial bundle. Browsers share one request per module, so
 * calling a loader early (preloadApp) and again when the window renders downloads the code once.
 */
export const appLoaders = {
  finder: () => import("@/features/finder/components/finder-app").then((m) => ({ default: m.FinderApp })),
  safari: () => import("@/features/safari/components/safari-app").then((m) => ({ default: m.SafariApp })),
  terminal: () => import("@/features/terminal/components/terminal-app").then((m) => ({ default: m.TerminalApp })),
  notes: () => import("@/features/notes/components/notes-app").then((m) => ({ default: m.NotesApp })),
  "system-settings": () => import("@/features/settings/components/settings-app").then((m) => ({ default: m.SettingsApp })),
  photos: () => import("@/features/photos/components/photos-app").then((m) => ({ default: m.PhotosApp })),
  github: () => import("@/features/social/github/github-app").then((m) => ({ default: m.GitHubApp })),
  linkedin: () => import("@/features/social/linkedin/linkedin-app").then((m) => ({ default: m.LinkedInApp })),
  instagram: () => import("@/features/social/instagram/instagram-app").then((m) => ({ default: m.InstagramApp })),
  preview: () => import("@/features/preview/components/preview-app").then((m) => ({ default: m.PreviewApp })),
  mail: () => import("@/features/mail/components/mail-app").then((m) => ({ default: m.MailApp })),
  "get-info": () => import("@/features/get-info/components/get-info-app").then((m) => ({ default: m.GetInfoApp })),
  "project-viewer": () => import("@/features/project-viewer/components/project-viewer").then((m) => ({ default: m.ProjectViewer })),
} as const;

type LoadableApp = keyof typeof appLoaders;

const isLoadable = (appId: string): appId is LoadableApp => Object.hasOwn(appLoaders, appId);

/** Starts downloading an application's code ahead of its window. Safe to call repeatedly. */
export function preloadApp(appId: ApplicationId | string) {
  if (isLoadable(appId)) void appLoaders[appId]().catch(() => {});
}

/**
 * Preloads every application once the page has been idle for a moment, so first opens feel instant
 * without those bytes competing with the first paint. Skipped when the visitor has asked to save data.
 */
export function preloadAllWhenIdle(also?: () => void) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "")) return () => {};
  let cancelled = false;
  const run = () => {
    for (const id of Object.keys(appLoaders)) {
      if (cancelled) return;
      preloadApp(id);
    }
    also?.();
  };
  // Safari has no requestIdleCallback; a short timer does the same job there.
  const idle = typeof window.requestIdleCallback === "function";
  const handle = idle ? window.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 2500);
  return () => {
    cancelled = true;
    if (idle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}
