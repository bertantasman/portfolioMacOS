import { describeFailure, resolvePath } from "../utils/path-resolver";
import { line, type Command } from "../types/terminal";

export const cd: Command = {
  name: "cd",
  description: "Change directory",
  run: ({ args, env, currentDirectoryId }) => {
    if (args.length > 1) return { output: [line("cd: too many arguments")] };
    if (args.length === 0) return { nextDirectoryId: env.homeId };

    const target = args[0];
    const result = resolvePath(env, currentDirectoryId, target);
    if (!result.ok) return { output: [line(`cd: ${describeFailure(result.reason, target)}`)] };
    if (result.file.type !== "folder") return { output: [line(`cd: not a directory: ${target}`)] };
    return { nextDirectoryId: result.file.id };
  },
};
