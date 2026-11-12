import type { VirtualFile } from "@/lib/virtual-fs/types";
import type { TerminalEnvironment } from "../types/terminal";

export type PathResult =
  | { ok: true; file: VirtualFile }
  | { ok: false; reason: "not-found" | "not-a-directory" };

/**
 * Resolves a path against the shared virtual file system.
 * - "~" and "~/x" start at home; "/x" starts at the root (a leading
 *   "/Users/<name>" is accepted and ignored, since the root is the home folder);
 * - ".." never leaves the root; names match case-insensitively, like macOS.
 */
export function resolvePath(
  env: TerminalEnvironment,
  currentDirectoryId: string,
  input: string,
): PathResult {
  const { fs } = env;
  const root = fs.getFile(fs.rootId)!;
  let current: VirtualFile;
  let rest = input;

  if (input === "~" || input.startsWith("~/")) {
    current = fs.getFile(env.homeId) ?? root;
    rest = input.slice(1);
  } else if (input.startsWith("/")) {
    current = root;
    const prefix = env.homePath.toLowerCase();
    const lower = input.toLowerCase();
    if (lower === prefix || lower.startsWith(`${prefix}/`)) rest = input.slice(env.homePath.length);
  } else {
    current = fs.getFile(currentDirectoryId) ?? root;
  }

  for (const segment of rest.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      current = fs.getParent(current.id) ?? current;
      continue;
    }
    if (current.type !== "folder") return { ok: false, reason: "not-a-directory" };
    const wanted = segment.toLowerCase();
    const child = fs.getChildren(current.id).find((c) => c.name.toLowerCase() === wanted);
    if (!child) return { ok: false, reason: "not-found" };
    current = child;
  }
  return { ok: true, file: current };
}

/** Absolute display path, e.g. "/Users/bertan/Documents/Projects". */
export function getDisplayPath(env: TerminalEnvironment, id: string): string {
  const names = env.fs
    .getPath(id)
    .slice(1)
    .map((f) => f.name);
  return [env.homePath, ...names].join("/");
}

/** zsh-style prompt directory: "~" for home, otherwise the folder's own name. */
export function getPromptDirectory(env: TerminalEnvironment, id: string): string {
  if (id === env.homeId) return "~";
  return env.fs.getFile(id)?.name ?? "/";
}

/** Error text for a failed resolution, in the style of `cmd: …`. */
export function describeFailure(reason: "not-found" | "not-a-directory", input: string) {
  return reason === "not-found" ? `no such file or directory: ${input}` : `not a directory: ${input}`;
}

/** Error text in the style of `cmd: path: …` (used by ls and cat). */
export function posixMessage(reason: "not-found" | "not-a-directory") {
  return reason === "not-found" ? "No such file or directory" : "Not a directory";
}
