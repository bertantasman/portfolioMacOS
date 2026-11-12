export const VIRTUAL_FILE_TYPES = ["folder", "project", "document", "image", "application"] as const;

export type VirtualFileType = (typeof VIRTUAL_FILE_TYPES)[number];

export interface VirtualFile {
  /** Stable, unique identifier. */
  id: string;
  name: string;
  type: VirtualFileType;
  /** null only for the single root of the file system. */
  parentId: string | null;
  /** Required for (and only valid on) `project` files: the underlying project record. */
  projectId?: string;
  /** Required for (and only valid on) `image` files that open in Photos: the media record. */
  mediaId?: string;
  /** Lower-case extension without the dot, e.g. "pdf". */
  extension?: string;
  /** Bytes. Leave unset when unknown. */
  size?: number;
  /** ISO 8601. Leave unset when unknown. */
  modifiedAt?: string;
  /** Overrides the derived kind label, e.g. "Volume". */
  kind?: string;
  tags?: readonly string[];
  /** Plain-text body for "txt"/"md" files (shown by Terminal's `cat`). Leave unset when unknown. */
  textContent?: string;
  /** Required for (and only valid on) `document` files that open in Preview: the document record. */
  documentId?: string;
  /** A document that opens as a note in Notes (profile entries such as Education or Experience): the note's id. */
  noteId?: string;
  /** A one-line description shown in Get Info. Leave unset when there is nothing to say. */
  description?: string;
}

export type SortKey = "name" | "modified" | "kind";
export type SortDirection = "asc" | "desc";
