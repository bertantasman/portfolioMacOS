import { commands } from "../commands";
import type { TerminalEnvironment } from "../types/terminal";
import { resolvePath } from "./path-resolver";

export interface Completion {
  /** New input text (unchanged if nothing could be completed). */
  value: string;
  /** Set when several candidates remain and the input couldn't be extended. */
  candidates?: { name: string; isFolder: boolean }[];
}

interface WordInfo {
  head: string; // text before the word being completed
  typed: string; // the word with quotes/escapes removed
  quote: '"' | "'" | null;
}

/** Finds the word at the end of the input, honouring quotes and backslashes. */
function lastWord(text: string): WordInfo {
  let start = 0;
  let inWord = false;
  let quote: '"' | "'" | null = null;
  let escaped = false;
  let typed = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      typed += ch;
    } else if (ch === "\\" && quote !== "'") {
      if (!inWord) [inWord, start, typed] = [true, i, ""];
      escaped = true;
    } else if (quote) {
      if (ch === quote) quote = null;
      else typed += ch;
    } else if (ch === '"' || ch === "'") {
      if (!inWord) [inWord, start, typed] = [true, i, ""];
      quote = ch;
    } else if (/\s/.test(ch)) {
      inWord = false;
      typed = "";
    } else {
      if (!inWord) [inWord, start, typed] = [true, i, ""];
      typed += ch;
    }
  }
  return inWord ? { head: text.slice(0, start), typed, quote } : { head: text, typed: "", quote: null };
}

const escapeWord = (value: string) => value.replace(/([ "'\\])/g, "\\$1");

function commonPrefix(values: string[]) {
  let prefix = values[0];
  for (const v of values) {
    let i = 0;
    while (i < prefix.length && i < v.length && prefix[i].toLowerCase() === v[i].toLowerCase()) i++;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

/** Completes the last word of `input` as a command name or a path. */
export function complete(
  input: string,
  currentDirectoryId: string,
  env: TerminalEnvironment,
): Completion {
  const { head, typed, quote } = lastWord(input);
  const isCommand = head.trim() === "";

  // Candidate names and where in `typed` the completed part begins.
  let dirPart = "";
  let namePart = typed;
  let options: { name: string; isFolder: boolean }[];

  if (isCommand) {
    options = commands.map((c) => ({ name: c.name, isFolder: false }));
  } else {
    const slash = typed.lastIndexOf("/");
    dirPart = slash === -1 ? "" : typed.slice(0, slash + 1);
    namePart = typed.slice(slash + 1);
    const dir = resolvePath(env, currentDirectoryId, dirPart === "" ? "." : dirPart);
    if (!dir.ok || dir.file.type !== "folder") return { value: input };
    options = env.fs.getChildren(dir.file.id).map((f) => ({ name: f.name, isFolder: f.type === "folder" }));
  }

  const lowerName = namePart.toLowerCase();
  const matches = options
    .filter((o) => o.name.toLowerCase().startsWith(lowerName))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (matches.length === 0) return { value: input };

  // `finished` means the match is unique: commands and files get a closing
  // quote or trailing space; folders stay open so the path can be extended.
  const format = (name: string, finished: boolean, folder: boolean) => {
    const closing = finished && !folder;
    if (quote) return `${quote}${dirPart}${name}${closing && !isCommand ? quote : ""}${closing && isCommand ? " " : ""}`;
    return `${isCommand ? name : escapeWord(dirPart + name)}${closing ? " " : ""}`;
  };

  if (matches.length === 1) {
    const only = matches[0];
    return { value: head + format(only.name, true, only.isFolder) };
  }

  const prefix = commonPrefix(matches.map((m) => m.name));
  if (prefix.length > namePart.length) {
    return { value: head + format(prefix, false, false) };
  }
  return { value: input, candidates: matches };
}
