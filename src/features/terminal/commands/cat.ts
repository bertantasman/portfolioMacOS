import { profileFileLines } from "@/lib/profile/text";
import { line, type Command, type OutputLine } from "../types/terminal";
import { posixMessage, resolvePath } from "../utils/path-resolver";

export const cat: Command = {
  name: "cat",
  description: "Display file information",
  run: ({ args, env, currentDirectoryId }) => {
    if (args.length === 0) return { output: [line("usage: cat <file>")] };

    const output: OutputLine[] = [];
    for (const target of args) {
      const result = resolvePath(env, currentDirectoryId, target);
      if (!result.ok) {
        output.push(line(`cat: ${target}: ${posixMessage(result.reason)}`));
        continue;
      }
      const { file } = result;
      if (file.type === "folder") {
        output.push(line(`cat: ${target}: Is a directory`));
      } else if (file.type === "project" && file.projectId) {
        const summary = env.getProjectSummary(file.projectId);
        if (summary) output.push(...summary.map((text) => line(text)));
        else output.push(line(`cat: ${target}: No such file or directory`));
      } else if (file.textContent !== undefined && (file.extension === "txt" || file.extension === "md")) {
        output.push(...file.textContent.split("\n").map((text) => line(text)));
      } else if (profileFileLines(file.id)) {
        // Entries in the Education, Experience and Skills folders print the profile's own text.
        output.push(...profileFileLines(file.id)!.map((text) => line(text)));
      } else {
        output.push(line(`cat: ${target}: unsupported file type`));
      }
    }
    return { output };
  },
};
