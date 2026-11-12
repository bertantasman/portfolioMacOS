/** A span of inline text. `href` is validated at render time. */
export interface Inline {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

/** Note content as data. Rendered with React elements only; never as HTML. */
export type NoteBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; inline: readonly Inline[] }
  | { type: "list"; items: readonly (readonly Inline[])[] }
  | { type: "separator" }
  | { type: "keyValue"; rows: readonly { label: string; value: readonly Inline[] }[] }
  /** A reference to a project in the registry; shown as an openable row. */
  | { type: "project"; projectId: string }
  /** Marks content that hasn't been provided yet. Never indexed by search. */
  | { type: "incomplete"; message: string };

export type NoteContentType =
  | "static"
  | "profile"
  | "journey"
  | "philosophy"
  | "skills"
  | "tools"
  | "education"
  | "experience"
  | "projects"
  | "contact";

export interface NoteFolder {
  id: string;
  name: string;
}

export interface PortfolioNote {
  /** Stable identifier. */
  id: string;
  title: string;
  folderId: string;
  /** Where the content comes from. Everything but "static" is derived from central data. */
  contentType: NoteContentType;
  /** For "projects" notes: which projects to list. */
  projectFilter?: "current" | "featured";
  /** Content for "static" notes. Leave unset until it has been written. */
  blocks?: readonly NoteBlock[];
  pinned?: boolean;
  /** ISO 8601. Leave unset when unknown; no date is shown then. */
  createdAt?: string;
  updatedAt?: string;
}
