import type { TerminalEntry } from "../types/terminal";
import { TerminalLine } from "./terminal-line";
import { TerminalPrompt } from "./terminal-prompt";

/** The scrollback. Only previous entries; the live prompt is TerminalInput. */
export function TerminalOutput({ entries }: { entries: readonly TerminalEntry[] }) {
  return (
    <>
      {entries.map((entry) =>
        entry.type === "input" ? (
          <div key={entry.id} className="flex break-words whitespace-pre-wrap">
            <TerminalPrompt prompt={entry.prompt} />
            <span className="min-w-0 break-words whitespace-pre-wrap">{entry.command}</span>
          </div>
        ) : (
          entry.lines.map((l, i) => <TerminalLine key={`${entry.id}-${i}`} line={l} />)
        ),
      )}
    </>
  );
}
