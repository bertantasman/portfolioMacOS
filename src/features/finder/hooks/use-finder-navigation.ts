"use client";

import { useCallback, useReducer } from "react";

interface History {
  entries: readonly string[];
  index: number;
}

type Action =
  | { type: "go"; folderId: string }
  | { type: "back" }
  | { type: "forward" };

function reducer(state: History, action: Action): History {
  switch (action.type) {
    case "go":
      if (state.entries[state.index] === action.folderId) return state;
      // Visiting a new folder discards any forward history.
      return {
        entries: [...state.entries.slice(0, state.index + 1), action.folderId],
        index: state.index + 1,
      };
    case "back":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "forward":
      return state.index < state.entries.length - 1 ? { ...state, index: state.index + 1 } : state;
  }
}

/** Per-window navigation: one history stack, current folder derived from it. */
export function useFinderNavigation(initialFolderId: string) {
  const [history, dispatch] = useReducer(reducer, {
    entries: [initialFolderId],
    index: 0,
  });

  return {
    currentFolderId: history.entries[history.index],
    canGoBack: history.index > 0,
    canGoForward: history.index < history.entries.length - 1,
    goTo: useCallback((folderId: string) => dispatch({ type: "go", folderId }), []),
    goBack: useCallback(() => dispatch({ type: "back" }), []),
    goForward: useCallback(() => dispatch({ type: "forward" }), []),
  };
}
