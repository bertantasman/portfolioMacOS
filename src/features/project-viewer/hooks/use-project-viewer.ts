"use client";

import { useMemo } from "react";
import { getProjectById } from "@/lib/projects/registry";
import { useRepositoryStore } from "@/store/repository-store";
import { getProjectDetail } from "../utils/project-detail";
import { getProjectMetadata } from "../utils/project-utils";

/** Resolves a project id (from the window's payload) into display-ready data. */
export function useProjectViewer(projectId: string) {
  // Re-resolve when GitHub data refreshes, so an open window shows the new facts without being rebuilt.
  const repositories = useRepositoryStore((s) => s.repositories);
  return useMemo(() => {
    void repositories;
    const project = getProjectById(projectId);
    if (!project) return null;
    return { project, detail: getProjectDetail(project), metadata: getProjectMetadata(project) };
  }, [projectId, repositories]);
}
