import { create } from "zustand";
import { reconcileRepositories } from "@/lib/github/reconcile";
import type { GitHubFailure, GitHubRepository, RepositoriesResponse } from "@/lib/github/types";

const EMPTY: GitHubRepository[] = [];

interface RepositoryStore {
  status: "idle" | "loading" | "ready" | "error";
  /** The shared, normalized list. Every app reads this; none of them calls GitHub itself. */
  repositories: GitHubRepository[];
  username: string | null;
  fetchedAt: number | null;
  truncated: boolean;
  /** GitHub failed on the last refresh and the previous copy is being shown. */
  stale: boolean;
  error: { reason: GitHubFailure; message: string } | null;
  refreshing: boolean;
  /** Loads once per page; later callers share the same request. */
  load: () => Promise<void>;
  /** Manual refresh. The server limits how often GitHub is actually asked. */
  refresh: () => Promise<void>;
}

let inflight: Promise<void> | null = null;

async function request(url: string): Promise<RepositoriesResponse> {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    return (await response.json()) as RepositoriesResponse;
  } catch {
    return { ok: false, reason: "unavailable", message: "The portfolio couldn’t reach its server." };
  }
}

export const useRepositoryStore = create<RepositoryStore>()((set, get) => {
  const run = (url: string): Promise<void> => {
    if (inflight) return inflight;
    const had = get().status === "ready";
    set(had ? { refreshing: true } : { status: "loading" });
    inflight = request(url)
      .then((result) => {
        if (result.ok) {
          // Replace the list only when something changed, so open windows aren't re-rendered for nothing.
          const previous = get().repositories;
          // A fetch cut short by the pagination limit is not a full snapshot: nothing is dropped because of it.
          const incoming = reconcileRepositories(previous, result.repositories, { complete: !result.truncated });
          const same = previous.length === incoming.length && JSON.stringify(previous) === JSON.stringify(incoming);
          set({
            status: "ready",
            repositories: same ? previous : incoming,
            username: result.username,
            fetchedAt: result.fetchedAt,
            truncated: result.truncated,
            stale: result.stale,
            error: null,
            refreshing: false,
          });
        } else {
          // A failure never wipes what is already on screen.
          set((s) => ({ status: s.status === "ready" ? "ready" : "error", error: { reason: result.reason, message: result.message }, stale: s.status === "ready", refreshing: false }));
        }
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };

  return {
    status: "idle",
    repositories: EMPTY,
    username: null,
    fetchedAt: null,
    truncated: false,
    stale: false,
    error: null,
    refreshing: false,
    load: () => (get().status === "idle" ? run("/api/github/repositories") : (inflight ?? Promise.resolve())),
    refresh: () => run("/api/github/repositories?refresh=1"),
  };
});
