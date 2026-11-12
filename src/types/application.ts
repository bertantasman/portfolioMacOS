import type { ApplicationWindowConfig } from "@/types/window";

export type ApplicationId =
  | "finder"
  | "launchpad"
  | "get-info"
  | "mission-control"
  | "safari"
  | "terminal"
  | "photos"
  | "notes"
  | "mail"
  | "github"
  | "linkedin"
  | "instagram"
  | "system-settings"
  | "project-viewer"
  | "preview";

/** What an application can open from the virtual file system. */
export type OpenKind = "folder" | "project" | "image" | "pdf" | "note";

/** "primary" and "identity" are the pinned Dock groups; "social" and "system" are kept for apps that are not pinned. */
export type DockSection = "primary" | "identity" | "social" | "system";

export interface ApplicationDefinition {
  /** Stable identifier; safe to persist and to use as a React key. */
  id: ApplicationId;
  name: string;
  /** Path to the icon asset under /public. */
  icon: string;
  /** "internal" apps open in the desktop; "external" apps link to a profile. */
  type: "internal" | "external";
  dockSection: DockSection;
  /** Appears in Launchpad and Spotlight. */
  launchable: boolean;
  /** Pinned to the Dock by default. */
  inDock: boolean;
  /** Extra Spotlight search terms (the name is always searchable). */
  searchKeywords?: readonly string[];
  /** Absolute http(s) URL for external apps. Empty/undefined means not configured. */
  externalUrl?: string;
  /** File kinds this application opens. Drives "Open With" in context menus. */
  opens?: readonly OpenKind[];
  /** Set for desktop overlays (e.g. Launchpad): launching toggles the overlay instead of opening a window. */
  overlay?: "launchpad" | "mission-control";
  /** Window defaults for internal applications; generic defaults apply if omitted. */
  window?: ApplicationWindowConfig;
}
