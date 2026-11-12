import { sortFiles } from "@/lib/virtual-fs/sort";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import { posixMessage, resolvePath } from "../utils/path-resolver";
import { line, type Command, type OutputLine, type Segment } from "../types/terminal";

const names = (files: readonly VirtualFile[]): OutputLine => {
  const segments: Segment[] = [];
  files.forEach((f, i) => {
    if (i > 0) segments.push({ text: "  " });
    segments.push({ text: f.name, tone: f.type === "folder" ? "folder" : undefined });
  });
  return { segments };
};

export const ls: Command = {
  name: "ls",
  description: "List directory contents",
  run: ({ args, env, currentDirectoryId }) => {
    const flag = args.find((a) => a.startsWith("-"));
    if (flag) return { output: [line(`ls: unsupported option: ${flag}`)] };

    const targets = args.length > 0 ? args : ["."];
    const output: OutputLine[] = [];
    targets.forEach((target, i) => {
      const result = resolvePath(env, currentDirectoryId, target);
      if (!result.ok) {
        output.push(line(`ls: ${target}: ${posixMessage(result.reason)}`));
        return;
      }
      if (targets.length > 1) {
        if (i > 0) output.push(line(""));
        output.push(line(`${target}:`));
      }
      const { file } = result;
      if (file.type !== "folder") {
        output.push(line(file.name));
        return;
      }
      const children = sortFiles(env.fs.getChildren(file.id));
      if (children.length > 0) output.push(names(children));
    });
    return { output };
  },
};
