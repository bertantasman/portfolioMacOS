"use client";

import { useEffect, useReducer } from "react";
import type { SafariRoute, SafariState, SafariTab } from "../types/safari";
import { currentRoute } from "../types/safari";

type Action =
  | { type: "navigate"; route: SafariRoute }
  | { type: "back" }
  | { type: "forward" }
  | { type: "reload" }
  | { type: "finishLoading"; tabId: string }
  | { type: "newTab"; route?: SafariRoute }
  | { type: "closeTab"; tabId: string }
  | { type: "selectTab"; tabId: string }
  | { type: "toggleSidebar" };

const LOAD_MS = 350;

const makeTab = (number: number, route: SafariRoute = "start"): SafariTab => ({
  id: `tab-${number}`,
  history: [route],
  index: 0,
  reloadCount: 0,
  loading: false,
});

const bumpVisit = (visits: SafariState["visits"], route: SafariRoute) =>
  route === "start" ? visits : { ...visits, [route]: (visits[route] ?? 0) + 1 };

function patchActive(state: SafariState, fn: (tab: SafariTab) => SafariTab): SafariState {
  return {
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === state.activeTabId ? fn(tab) : tab)),
  };
}

function reducer(state: SafariState, action: Action): SafariState {
  const active = state.tabs.find((t) => t.id === state.activeTabId)!;
  switch (action.type) {
    case "navigate": {
      if (currentRoute(active) === action.route) return state;
      const next = patchActive(state, (tab) => ({
        ...tab,
        // Visiting a new page drops any forward history.
        history: [...tab.history.slice(0, tab.index + 1), action.route],
        index: tab.index + 1,
        loading: false,
      }));
      return { ...next, visits: bumpVisit(state.visits, action.route) };
    }
    case "back":
      return active.index > 0 ? patchActive(state, (t) => ({ ...t, index: t.index - 1 })) : state;
    case "forward":
      return active.index < active.history.length - 1
        ? patchActive(state, (t) => ({ ...t, index: t.index + 1 }))
        : state;
    case "reload":
      return patchActive(state, (t) => ({ ...t, reloadCount: t.reloadCount + 1, loading: true }));
    case "finishLoading":
      return {
        ...state,
        tabs: state.tabs.map((t) => (t.id === action.tabId && t.loading ? { ...t, loading: false } : t)),
      };
    case "newTab": {
      const tab = makeTab(state.nextTabNumber, action.route);
      return {
        ...state,
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        nextTabNumber: state.nextTabNumber + 1,
        visits: action.route ? bumpVisit(state.visits, action.route) : state.visits,
      };
    }
    case "closeTab": {
      const index = state.tabs.findIndex((t) => t.id === action.tabId);
      if (index === -1) return state;
      const remaining = state.tabs.filter((t) => t.id !== action.tabId);
      if (remaining.length === 0) {
        // Closing the last tab leaves a single fresh Start Page tab.
        const tab = makeTab(state.nextTabNumber);
        return { ...state, tabs: [tab], activeTabId: tab.id, nextTabNumber: state.nextTabNumber + 1 };
      }
      const activeTabId =
        state.activeTabId === action.tabId
          ? remaining[Math.min(index, remaining.length - 1)].id
          : state.activeTabId;
      return { ...state, tabs: remaining, activeTabId };
    }
    case "selectTab":
      return state.tabs.some((t) => t.id === action.tabId) && state.activeTabId !== action.tabId
        ? { ...state, activeTabId: action.tabId }
        : state;
    case "toggleSidebar":
      return { ...state, sidebarOpen: !state.sidebarOpen };
  }
}

function initialState(): SafariState {
  const tab = makeTab(1);
  return { tabs: [tab], activeTabId: tab.id, sidebarOpen: false, visits: {}, nextTabNumber: 2 };
}

/** Window-scoped Safari state: two Safari windows never share tabs or history. */
export function useSafariNavigation() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Reload shows a brief loading state.
  const loadingIds = state.tabs.filter((t) => t.loading).map((t) => t.id).join(",");
  useEffect(() => {
    const timers = loadingIds
      .split(",")
      .filter(Boolean)
      .map((tabId) => setTimeout(() => dispatch({ type: "finishLoading", tabId }), LOAD_MS));
    return () => timers.forEach(clearTimeout);
  }, [loadingIds]);

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId)!;

  return {
    state,
    activeTab,
    route: currentRoute(activeTab),
    canGoBack: activeTab.index > 0,
    canGoForward: activeTab.index < activeTab.history.length - 1,
    navigate: (route: SafariRoute) => dispatch({ type: "navigate", route }),
    goBack: () => dispatch({ type: "back" }),
    goForward: () => dispatch({ type: "forward" }),
    reload: () => dispatch({ type: "reload" }),
    home: () => dispatch({ type: "navigate", route: "start" }),
    newTab: (route?: SafariRoute) => dispatch({ type: "newTab", route }),
    closeTab: (tabId: string) => dispatch({ type: "closeTab", tabId }),
    selectTab: (tabId: string) => dispatch({ type: "selectTab", tabId }),
    toggleSidebar: () => dispatch({ type: "toggleSidebar" }),
  };
}

export type SafariNavigation = ReturnType<typeof useSafariNavigation>;
