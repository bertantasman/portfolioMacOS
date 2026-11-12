import type { KeyboardEvent, RefObject } from "react";
import { TerminalPrompt } from "./terminal-prompt";

interface TerminalInputProps {
  prompt: string;
  value: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryPrev: () => void;
  onHistoryNext: () => void;
  onComplete: () => void;
  onClear: () => void;
  onInterrupt: () => void;
}

/** The live prompt line: an unstyled input that reads as part of the output. */
export function TerminalInput({
  prompt,
  value,
  inputRef,
  onChange,
  onSubmit,
  onHistoryPrev,
  onHistoryNext,
  onComplete,
  onClear,
  onInterrupt,
}: TerminalInputProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handled only here (not globally), so other windows' shortcuts are untouched.
    if (e.ctrlKey && !e.metaKey && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === "l") {
        e.preventDefault();
        onClear();
      } else if (key === "c") {
        e.preventDefault();
        onInterrupt();
      }
      return;
    }
    if (e.metaKey || e.altKey) return;
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        onSubmit();
        break;
      case "ArrowUp":
        e.preventDefault();
        onHistoryPrev();
        break;
      case "ArrowDown":
        e.preventDefault();
        onHistoryNext();
        break;
      case "Tab":
        e.preventDefault();
        onComplete();
        break;
    }
  };

  return (
    <div className="flex">
      <TerminalPrompt prompt={prompt} />
      <input
        ref={inputRef}
        type="text"
        aria-label="Terminal command input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent p-0 text-[#e5e5e5] caret-[#e5e5e5] outline-none [caret-shape:block]"
      />
    </div>
  );
}
