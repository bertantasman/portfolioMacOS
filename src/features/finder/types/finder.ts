import type { VirtualFile } from "@/lib/virtual-fs/types";

/** Called when an image item that has a media record is opened. */
export type OpenMediaHandler = (mediaId: string, file: VirtualFile) => void;

/** Called when a document that has a document record is opened. */
export type OpenDocumentHandler = (documentId: string, file: VirtualFile) => void;

/** Called when a document that opens as a note (a profile entry) is opened. */
export type OpenNoteHandler = (noteId: string, file: VirtualFile) => void;

/** Called when a project item is opened; PROMPT 09 connects this to a viewer. */
export type OpenProjectHandler = (projectId: string, file: VirtualFile) => void;

export type FinderViewMode = "icon" | "list";

export type SidebarIconKey =
  | "airdrop"
  | "recents"
  | "applications"
  | "desktop"
  | "documents"
  | "downloads"
  | "computer"
  | "disk";

export interface SidebarEntry {
  id: string;
  label: string;
  /** Present for tags, which render a coloured dot instead of an icon. */
  color?: string;
  icon?: SidebarIconKey;
  /** Folder this entry opens. Entries without one are shown disabled. */
  folderId?: string;
}

export interface SidebarSection {
  id: string;
  title: string;
  entries: readonly SidebarEntry[];
}
