import { line, type Command } from "../types/terminal";

export const whoami: Command = {
  name: "whoami",
  description: "Display developer information",
  run: ({ env }) => ({ output: [line(env.fullName ?? env.displayName), line(env.role)] }),
};
