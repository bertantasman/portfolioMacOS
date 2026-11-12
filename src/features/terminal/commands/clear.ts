import type { Command } from "../types/terminal";

export const clear: Command = {
  name: "clear",
  description: "Clear terminal output",
  run: () => ({ clearScreen: true }),
};
