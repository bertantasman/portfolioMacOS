import { create } from "zustand";
import type { GitHubProfile, ProfileResponse } from "@/lib/github/types";

interface GitHubProfileStore {
  status: "idle" | "loading" | "ready" | "error";
  profile: GitHubProfile | null;
  /** Loads once per page; every caller shares the same request and result. */
  load: () => Promise<void>;
}

let inflight: Promise<void> | null = null;

export const useGitHubProfileStore = create<GitHubProfileStore>()((set, get) => ({
  status: "idle",
  profile: null,
  load: () => {
    if (get().status !== "idle") return inflight ?? Promise.resolve();
    set({ status: "loading" });
    inflight = fetch("/api/github/profile", { headers: { Accept: "application/json" } })
      .then((r) => r.json() as Promise<ProfileResponse>)
      .then((result) => set(result.ok ? { status: "ready", profile: result.profile } : { status: "error" }))
      .catch(() => set({ status: "error" }))
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },
}));
