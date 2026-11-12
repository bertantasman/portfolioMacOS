"use client";

import { useEffect } from "react";
import { getAllMedia } from "@/data/media";
import { documents } from "@/data/documents";
import { projects as curatedProjects } from "@/data/projects";
import { buildContentAudit, formatContentAudit } from "@/lib/portfolio/audit";
import { profile } from "@/data/profile";
import { getMissingProfileInfo, validateProfile } from "@/lib/profile/validate";
import { formatContentReport, getContentReport, validateProjectContent } from "@/lib/projects/maintenance";
import { getRegistry } from "@/lib/projects/registry";
import { useRepositoryStore } from "@/store/repository-store";

/** Starts the single GitHub repository request for the whole page. Every app then reads the shared store. */
export function RepositoryLoader() {
  const load = useRepositoryStore((s) => s.load);
  const repositories = useRepositoryStore((s) => s.repositories);
  useEffect(() => {
    void load();
  }, [load]);

  // Developer maintenance only: warnings about the curated content, and a report of what each project lacks.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const registry = getRegistry();
    const problems = validateProjectContent(registry);
    if (problems.length > 0) console.warn(`[project content] ${problems.length} problem(s):\n - ${problems.join("\n - ")}`);
    const report = () => formatContentReport(getContentReport(registry));
    (window as unknown as { projectContentReport?: () => string }).projectContentReport = report;
    const entries = getContentReport(registry);
    const incomplete = entries.filter((e) => e.missing.length > 0).length;
    console.info(`[project content] ${incomplete} of ${entries.length} projects are missing something. Run projectContentReport() in the console for details.`);
    const w = window as unknown as { profileReport?: () => string; portfolioAudit?: () => string };
    const issues = validateProfile(profile, new Set(registry.all.map((x) => x.id)));
    if (issues.length > 0) console.warn(`[profile] ${issues.length} problem(s):\n - ${issues.map((i) => `${i.path}: ${i.message}`).join("\n - ")}`);
    w.profileReport = () => {
      const missing = getMissingProfileInfo(profile);
      return missing.length ? `Not provided yet:\n - ${missing.join("\n - ")}` : "Nothing is missing.";
    };
    w.portfolioAudit = () => {
      const state = useRepositoryStore.getState();
      return formatContentAudit(
        buildContentAudit({
          registry: getRegistry(),
          curated: curatedProjects,
          profile,
          media: getAllMedia(),
          documents,
          contentProblems: validateProjectContent(getRegistry()),
          repositoriesLoaded: state.status === "ready",
        }),
      );
    };
    console.info("[profile] Run portfolioAudit() for a full content audit, or profileReport() in the console to see what hasn't been provided yet.");
  }, [repositories]);
  return null;
}
