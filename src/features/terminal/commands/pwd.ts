import { getDisplayPath } from "../utils/path-resolver";
import { line, type Command } from "../types/terminal";

export const pwd: Command = {
  name: "pwd",
  description: "Print current directory",
  run: ({ env, currentDirectoryId }) => ({ output: [line(getDisplayPath(env, currentDirectoryId))] }),
};
