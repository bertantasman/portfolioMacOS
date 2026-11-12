import type { VirtualFile } from "@/lib/virtual-fs/types";
import type { VirtualFileSystem } from "@/lib/virtual-fs/filesystem";

export type Tone = "folder" | "muted" | "error";

export interface Segment {
  text: string;
  tone?: Tone;
}

/** One rendered line of output; always plain text, never HTML. */
export interface OutputLine {
  segments: readonly Segment[];
}

export const line = (text: string, tone?: Tone): OutputLine => ({ segments: [{ text, tone }] });

/** Everything a command may touch. Supplied by the app, faked in tests. */
export interface TerminalEnvironment {
  fs: VirtualFileSystem;
  /** Directory `~` refers to. */
  homeId: string;
  username: string;
  hostname: string;
  /** Cosmetic prefix for absolute paths, e.g. "/Users/bertan". */
  homePath: string;
  displayName: string;
  /** The full name from the profile; `whoami` prefers it. */
  fullName?: string;
  role: string;
  /** Plain-text description of a project, or undefined if it doesn't exist. */
  getProjectSummary: (projectId: string) => string[] | undefined;
  /** Opens (or focuses/restores) the project's viewer window. */
  openProject: (projectId: string) => void;
  /** Opens Photos on the image. */
  openMedia: (mediaId: string) => void;
  /** Opens Preview on the document. */
  openDocument: (documentId: string) => void;
  /** Opens Notes on the note. */
  openNote: (noteId: string) => void;
  /** Opens the Mail application. */
  openMail: () => void;
}

export interface CommandInfo {
  name: string;
  description: string;
}

export interface CommandContext {
  args: readonly string[];
  currentDirectoryId: string;
  env: TerminalEnvironment;
  /** The available commands, for `help`. */
  commands: readonly CommandInfo[];
}

export interface CommandResult {
  output?: readonly OutputLine[];
  nextDirectoryId?: string;
  clearScreen?: boolean;
}

export interface Command extends CommandInfo {
  run: (context: CommandContext) => CommandResult;
}

export type TerminalEntry =
  | { id: number; type: "input"; prompt: string; command: string }
  | { id: number; type: "output"; lines: readonly OutputLine[] };

export type { VirtualFile };
