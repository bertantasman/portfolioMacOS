import type { OutputLine, Tone } from "../types/terminal";

const toneClass: Record<Tone, string> = {
  folder: "text-[#6cb2ff] font-medium",
  muted: "text-white/45",
  error: "text-[#ff8a80]",
};

/** Renders one output line as plain text. React escapes it; no HTML is ever interpreted. */
export function TerminalLine({ line }: { line: OutputLine }) {
  return (
    <div className="min-h-[1.25em] break-words whitespace-pre-wrap">
      {line.segments.map((segment, i) => (
        <span key={i} className={segment.tone ? toneClass[segment.tone] : undefined}>
          {segment.text}
        </span>
      ))}
    </div>
  );
}
