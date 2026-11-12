"use client";

import { useReducer } from "react";
import { terminalConfig } from "@/config/terminal";
import { line, type OutputLine, type TerminalEntry, type TerminalEnvironment } from "../types/terminal";
import { complete } from "../utils/completion";
import { executeCommand } from "../utils/execute";
import { getPromptDirectory } from "../utils/path-resolver";

interface SessionState {
  currentDirectoryId: string;
  entries: readonly TerminalEntry[];
  input: string;
  /** Executed commands, oldest first. */
  history: readonly string[];
  /** Position while browsing history; equals history.length when not browsing. */
  historyIndex: number;
  /** What was typed before browsing history started. */
  draft: string;
  nextEntryId: number;
}

type Action =
  | { type: "setInput"; input: string }
  | { type: "commit"; prompt: string; command: string; output?: readonly OutputLine[]; directoryId?: string; clear?: boolean }
  | { type: "output"; prompt: string; command: string; lines: readonly OutputLine[] }
  | { type: "clear" }
  | { type: "historyPrev" }
  | { type: "historyNext" };

const WELCOME: readonly OutputLine[] = [
  line(`Welcome to ${terminalConfig.displayName}’s Portfolio Terminal.`),
  line("Type 'help' to see available commands."),
];

function initialState(homeId: string): SessionState {
  return {
    currentDirectoryId: homeId,
    entries: [{ id: 0, type: "output", lines: WELCOME }],
    input: "",
    history: [],
    historyIndex: 0,
    draft: "",
    nextEntryId: 1,
  };
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "setInput":
      return { ...state, input: action.input, historyIndex: state.history.length, draft: action.input };
    case "commit": {
      const command = action.command.trim();
      const last = state.history[state.history.length - 1];
      // Empty commands and immediate repeats are not recorded.
      const history = command && command !== last ? [...state.history, command] : state.history;
      let id = state.nextEntryId;
      const entries: TerminalEntry[] = action.clear ? [] : [...state.entries];
      if (!action.clear) {
        entries.push({ id: id++, type: "input", prompt: action.prompt, command: action.command });
        if (action.output && action.output.length > 0) {
          entries.push({ id: id++, type: "output", lines: action.output });
        }
      }
      return {
        ...state,
        entries,
        input: "",
        history,
        historyIndex: history.length,
        draft: "",
        currentDirectoryId: action.directoryId ?? state.currentDirectoryId,
        nextEntryId: id,
      };
    }
    case "output": {
      // Echo the line and show extra output without recording a command (Tab listing, ^C).
      const id = state.nextEntryId;
      const entries: TerminalEntry[] = [
        ...state.entries,
        { id, type: "input", prompt: action.prompt, command: action.command },
      ];
      if (action.lines.length > 0) entries.push({ id: id + 1, type: "output", lines: action.lines });
      return { ...state, entries, nextEntryId: id + 2 };
    }
    case "clear":
      return { ...state, entries: [] };
    case "historyPrev": {
      if (state.history.length === 0 || state.historyIndex === 0) return state;
      const index = state.historyIndex - 1;
      const draft = state.historyIndex === state.history.length ? state.input : state.draft;
      return { ...state, historyIndex: index, input: state.history[index], draft };
    }
    case "historyNext": {
      if (state.historyIndex >= state.history.length) return state;
      const index = state.historyIndex + 1;
      return {
        ...state,
        historyIndex: index,
        input: index === state.history.length ? state.draft : state.history[index],
      };
    }
  }
}

/** One Terminal window's session. Nothing here is shared between windows. */
export function useTerminal(env: TerminalEnvironment) {
  const [state, dispatch] = useReducer(reducer, env.homeId, initialState);

  const promptFor = (directoryId: string) =>
    `${env.username}@${env.hostname} ${getPromptDirectory(env, directoryId)} %`;
  const prompt = promptFor(state.currentDirectoryId);

  return {
    state,
    prompt,
    setInput: (input: string) => dispatch({ type: "setInput", input }),
    historyPrev: () => dispatch({ type: "historyPrev" }),
    historyNext: () => dispatch({ type: "historyNext" }),
    clear: () => dispatch({ type: "clear" }),

    /** Runs the current input. Commands execute here (not in the reducer) because some have side effects. */
    submit: () => {
      const command = state.input;
      const result = executeCommand(command, state.currentDirectoryId, env);
      dispatch({
        type: "commit",
        prompt,
        command,
        output: result.output,
        directoryId: result.nextDirectoryId,
        clear: result.clearScreen,
      });
    },

    /** Ctrl+C: abandon the current line. */
    interrupt: () => {
      dispatch({ type: "output", prompt, command: `${state.input}^C`, lines: [] });
      dispatch({ type: "setInput", input: "" });
    },

    /** Tab: complete in place, or list candidates when ambiguous. */
    complete: () => {
      const result = complete(state.input, state.currentDirectoryId, env);
      if (result.value !== state.input) {
        dispatch({ type: "setInput", input: result.value });
      } else if (result.candidates) {
        dispatch({
          type: "output",
          prompt,
          command: state.input,
          lines: [
            {
              segments: result.candidates.flatMap((c, i) => [
                ...(i > 0 ? [{ text: "  " }] : []),
                { text: c.name, tone: c.isFolder ? ("folder" as const) : undefined },
              ]),
            },
          ],
        });
      }
    },
  };
}
