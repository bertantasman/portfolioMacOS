"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useWindowChrome } from "@/components/windows/window-chrome";
import { terminalEnvironment } from "../config/environment";
import { useTerminal } from "../hooks/use-terminal";
import { TerminalInput } from "./terminal-input";
import { TerminalOutput } from "./terminal-output";

/** One Terminal window with its own independent session. */
export function TerminalApp() {
  const terminal = useTerminal(terminalEnvironment);
  const { isFocused } = useWindowChrome();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { entries, input } = terminal.state;

  // Focus the prompt when the window opens or becomes the active window.
  useEffect(() => {
    if (isFocused) inputRef.current?.focus({ preventScroll: true });
  }, [isFocused]);

  // Keep the newest output (and the prompt) in view.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, input]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Terminal"
      onClick={() => {
        // Don't steal focus while the visitor is selecting text to copy.
        if (window.getSelection()?.toString()) return;
        inputRef.current?.focus({ preventScroll: true });
      }}
      className="size-full cursor-text overflow-x-hidden overflow-y-auto bg-[#1e1e1e] p-2.5 font-mono text-[12px] leading-[1.25] text-[#e5e5e5] select-text"
    >
      <TerminalOutput entries={entries} />
      <TerminalInput
        prompt={terminal.prompt}
        value={input}
        inputRef={inputRef}
        onChange={terminal.setInput}
        onSubmit={terminal.submit}
        onHistoryPrev={terminal.historyPrev}
        onHistoryNext={terminal.historyNext}
        onComplete={terminal.complete}
        onClear={terminal.clear}
        onInterrupt={terminal.interrupt}
      />
    </div>
  );
}
