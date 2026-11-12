import { terminalConfig } from "@/config/terminal";
import type {
  ApplicationDefinition,
  ApplicationId,
  DockSection,
} from "@/types/application";
import type { ApplicationWindowConfig } from "@/types/window";

const win = (
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  resizable = true,
): ApplicationWindowConfig => ({
  defaultSize: { width, height },
  minSize: { width: minWidth, height: minHeight },
  resizable,
});

const icon = (id: string) => `/icons/apps/${id}.svg`;

/**
 * Single source of truth for every application. Order is the default Dock order.
 * `launchable` apps appear in Launchpad and Spotlight; `inDock` apps are also pinned to the Dock (a short list on
 * purpose: everything else stays one click away in Launchpad, Finder or Spotlight).
 */
export const applications: readonly ApplicationDefinition[] = [
  { id: "finder", window: { ...win(820, 540, 520, 320), titleBar: "unified" }, opens: ["folder"], name: "Finder", icon: icon("finder"), type: "internal", dockSection: "primary", launchable: true, inDock: true },
  // A desktop overlay, not a window: the Dock and Spotlight toggle it instead of opening a window.
  { id: "launchpad", overlay: "launchpad", searchKeywords: ["apps", "applications", "launcher"], name: "Launchpad", icon: icon("launchpad"), type: "internal", dockSection: "primary", launchable: true, inDock: true },
  { id: "mission-control", overlay: "mission-control", searchKeywords: ["windows", "overview", "expose"], name: "Mission Control", icon: icon("mission-control"), type: "internal", dockSection: "primary", launchable: true, inDock: false },
  { id: "safari", window: { ...win(1050, 700, 650, 450), titleBar: "unified" }, name: "Safari", icon: icon("safari"), type: "internal", dockSection: "primary", launchable: true, inDock: true },
  { id: "terminal", window: { ...win(760, 480, 480, 300), title: `${terminalConfig.username} — -${terminalConfig.shell}`, appearance: "dark" }, name: "Terminal", icon: icon("terminal"), type: "internal", dockSection: "identity", launchable: true, inDock: true },
  // Dock shortcuts to existing destinations (not applications): the Projects folder in Finder, the About Me note and a new message.
  { id: "projects", shortcut: { kind: "folder", folderId: "projects" }, name: "Projects", icon: icon("projects"), type: "internal", dockSection: "identity", launchable: false, inDock: true },
  { id: "about-me", shortcut: { kind: "note", noteId: "about-me" }, name: "About Me", icon: icon("about-me"), type: "internal", dockSection: "identity", launchable: false, inDock: true },
  { id: "contact", shortcut: { kind: "compose" }, name: "Contact", icon: icon("contact"), type: "internal", dockSection: "identity", launchable: false, inDock: true },
  { id: "photos", window: { ...win(1000, 700, 600, 450), titleBar: "unified" }, opens: ["image"], name: "Photos", icon: icon("photos"), type: "internal", dockSection: "primary", launchable: true, inDock: false },
  { id: "notes", window: { ...win(1000, 680, 650, 420), titleBar: "unified" }, opens: ["note"], name: "Notes", icon: icon("notes"), type: "internal", dockSection: "identity", launchable: true, inDock: false },
  { id: "mail", window: { ...win(1050, 720, 650, 450), titleBar: "unified" }, searchKeywords: ["email", "contact", "send message", "message"], name: "Mail", icon: icon("mail"), type: "internal", dockSection: "identity", launchable: true, inDock: false },
  { id: "github", window: win(900, 650, 560, 400), name: "GitHub", icon: icon("github"), type: "internal", dockSection: "social", launchable: true, inDock: false },
  { id: "linkedin", window: win(950, 700, 600, 420), name: "LinkedIn", icon: icon("linkedin"), type: "internal", dockSection: "social", launchable: true, inDock: false },
  { id: "instagram", window: win(850, 680, 520, 420), name: "Instagram", icon: icon("instagram"), type: "internal", dockSection: "social", launchable: true, inDock: false },
  { id: "system-settings", window: { ...win(950, 680, 650, 450), titleBar: "unified" }, name: "System Settings", icon: icon("system-settings"), type: "internal", dockSection: "system", launchable: true, inDock: false },
  // Opens individual projects as documents; launched from Finder, not the Dock.
  { id: "project-viewer", opens: ["project"], name: "Project Viewer", icon: icon("project-viewer"), type: "internal", dockSection: "primary", launchable: false, inDock: false, window: { ...win(850, 620, 520, 400), titleBar: "unified" } },
  // Opens PDFs as documents; launched from Finder, Spotlight or Terminal, not the Dock.
  { id: "preview", opens: ["pdf"], name: "Preview", icon: icon("preview"), type: "internal", dockSection: "primary", launchable: false, inDock: false, window: { ...win(900, 720, 550, 420), titleBar: "unified" } },
  // Shows one item's details; opened from context menus, one window per item.
  { id: "get-info", name: "Get Info", icon: icon("finder"), type: "internal", dockSection: "primary", launchable: false, inDock: false, window: win(340, 460, 300, 320, false) },
];

/**
 * Applications shown in Launchpad, in default order: every launchable app,
 * minus overlays such as Launchpad itself. Document viewers (Preview, Project Viewer) have no
 * standalone launch state, so they stay out.
 */
export const launchpadApplications: readonly ApplicationDefinition[] = applications.filter(
  (a) => a.launchable && !a.overlay,
);

export const dockSectionOrder: readonly DockSection[] = ["primary", "identity", "social", "system"];

export function getApplication(id: ApplicationId): ApplicationDefinition {
  const app = applications.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown application: ${id}`);
  return app;
}

/** The external URL if it is a valid absolute http(s) URL; otherwise undefined. */
export function getExternalUrl(app: ApplicationDefinition): string | undefined {
  if (!app.externalUrl) return undefined;
  try {
    const url = new URL(app.externalUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Default Dock contents grouped by section, in display order, with empty sections removed. */
export function getDockSections(): ApplicationDefinition[][] {
  return dockSectionOrder
    .map((section) =>
      applications.filter((a) => a.inDock && a.dockSection === section),
    )
    .filter((apps) => apps.length > 0);
}

export const defaultWindowConfig: ApplicationWindowConfig = {
  defaultSize: { width: 720, height: 480 },
  minSize: { width: 400, height: 260 },
  resizable: true,
};
