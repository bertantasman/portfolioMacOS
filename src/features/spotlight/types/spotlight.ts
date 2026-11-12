import type { AboutSectionId } from "@/lib/profile/selectors";
import type { VirtualFile } from "@/lib/virtual-fs/types";

export type SpotlightCategoryId = "applications" | "projects" | "files" | "notes" | "profile";

export type SpotlightItemType = "application" | "project" | "file" | "folder" | "note" | "profile";

/** What selecting a result does. Ids are resolved at action time, so stale ones fail safely. */
export type SpotlightTarget =
  | { kind: "application"; appId: string }
  | { kind: "project"; projectId: string }
  | { kind: "folder"; folderId: string }
  | { kind: "file"; fileId: string }
  | { kind: "note"; noteId: string }
  | { kind: "about"; section: AboutSectionId };

export type SpotlightIcon =
  | { kind: "image"; src: string }
  | { kind: "project" }
  | { kind: "file"; file: VirtualFile };

export interface SpotlightItem {
  /** Stable, unique across sources, e.g. "project:macos-portfolio". */
  id: string;
  type: SpotlightItemType;
  category: SpotlightCategoryId;
  title: string;
  subtitle?: string;
  keywords: readonly string[];
  /** Longer searchable text (note content, descriptions). */
  content?: string;
  icon: SpotlightIcon;
  target: SpotlightTarget;
}

export interface SpotlightGroup {
  /** "top" is the single best match, shown first. */
  category: SpotlightCategoryId | "top";
  label: string;
  items: readonly SpotlightItem[];
}
