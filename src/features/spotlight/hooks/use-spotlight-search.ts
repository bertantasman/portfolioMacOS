"use client";

import { useMemo } from "react";
import { useRepositoryStore } from "@/store/repository-store";
import type { SpotlightGroup } from "../types/spotlight";
import { getSearchIndex } from "../utils/build-search-index";
import { group, searchItems } from "../utils/search-utils";

const DEFAULT_APPS = ["finder", "safari", "terminal", "photos", "notes", "system-settings"];

/** Ranked groups for a query; with an empty query, a few application shortcuts. */
export function useSpotlightSearch(query: string): SpotlightGroup[] {
  // Repositories arriving or refreshing change the index; typing alone does not.
  const repositories = useRepositoryStore((s) => s.repositories);
  return useMemo(() => {
    void repositories;
    const index = getSearchIndex();
    if (query.trim() === "") {
      return group(DEFAULT_APPS.flatMap((id) => index.filter((i) => i.id === `app:${id}`)));
    }
    return searchItems(index, query);
  }, [query, repositories]);
}
