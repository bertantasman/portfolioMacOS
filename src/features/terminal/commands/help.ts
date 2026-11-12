import { line, type Command } from "../types/terminal";

export const help: Command = {
  name: "help",
  description: "Show available commands",
  run: ({ commands }) => {
    const width = Math.max(...commands.map((c) => c.name.length)) + 3;
    return {
      output: [
        line("Available commands:"),
        ...commands.map((c) => line(`${c.name.padEnd(width)}${c.description}`)),
      ],
    };
  },
};
