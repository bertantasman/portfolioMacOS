import type { SafariRoute } from "../config/safari-routes";

export type { SafariRoute };

export interface SafariTab {
  /** Stable id; never an array index. */
  id: string;
  history: readonly SafariRoute[];
  /** Position in `history` of the page being shown. */
  index: number;
  /** Bumped by reload so the page re-renders from scratch. */
  reloadCount: number;
  loading: boolean;
}

export interface SafariState {
  tabs: readonly SafariTab[];
  activeTabId: string;
  sidebarOpen: boolean;
  /** Session-only visit counts for internal routes. */
  visits: Readonly<Partial<Record<SafariRoute, number>>>;
  nextTabNumber: number;
}

export const currentRoute = (tab: SafariTab): SafariRoute => tab.history[tab.index];
