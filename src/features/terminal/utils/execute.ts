import { getCommand, commands } from "../commands";
import { line, type CommandResult, type TerminalEnvironment } from "../types/terminal";
import { parseCommandLine } from "./command-parser";

/** Runs one command line. Only registered commands run; nothing is evaluated. */
export function executeCommand(
  input: string,
  currentDirectoryId: string,
  env: TerminalEnvironment,
): CommandResult {
  const parsed = parseCommandLine(input);
  if (!parsed.ok) return { output: [line(`zsh: ${parsed.error}`)] };
  if (parsed.command === "") return {};

  const command = getCommand(parsed.command);
  if (!command) return { output: [line(`zsh: command not found: ${parsed.command}`)] };

  try {
    return command.run({
      args: parsed.args,
      currentDirectoryId,
      env,
      commands: commands.map(({ name, description }) => ({ name, description })),
    });
  } catch {
    // Never leak internals to the visitor.
    return { output: [line(`${command.name}: internal error`)] };
  }
}
