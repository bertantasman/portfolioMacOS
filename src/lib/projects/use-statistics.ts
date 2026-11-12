"use client";

import { useRepositoryStore } from "@/store/repository-store";
import { getDeveloperStatistics, type DeveloperStatistics } from "./statistics";

/** Re-renders only when the repository list changes, like the project registry. */
export function useDeveloperStatistics(): DeveloperStatistics {
  return getDeveloperStatistics(useRepositoryStore((s) => s.repositories));
}
