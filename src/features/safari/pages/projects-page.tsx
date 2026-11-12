"use client";

import { useEffect, useState } from "react";
import { ProjectIcon } from "@/components/file-icons";
import { StatisticsOverview } from "@/features/statistics/components/statistics-overview";
import { matchesFocus, type StatFocus } from "@/features/statistics/lib/focus";
import { categoryName, useProjectRegistry } from "@/lib/projects/registry";
import { getStatCategory } from "@/lib/projects/statistics";
import { useDeveloperStatistics } from "@/lib/projects/use-statistics";
import { useRepositoryStore } from "@/store/repository-store";
import { useWindowStore } from "@/store/window-store";

/** Every project in the portfolio, from the same unified registry as Finder, Spotlight and the widgets. */
export function ProjectsPage() {
  const registry = useProjectRegistry();
  const status = useRepositoryStore((s) => s.status);
  const load = useRepositoryStore((s) => s.load);
  const stats = useDeveloperStatistics();
  const [focus, setFocus] = useState<StatFocus | null>(null);
  const projects = registry.projects.filter((p) => matchesFocus(stats, p.id, focus));

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="@container min-h-full bg-surface px-10 py-10">
      <div className="mx-auto max-w-[820px]">
        <h1 className="text-[28px] font-semibold text-black/85">Projects</h1>
        <p className="mt-1 text-[14px] text-black/50">
          {focus ? `${projects.length} of ${registry.projects.length}` : registry.projects.length} {registry.projects.length === 1 ? "project" : "projects"}
          {status === "loading" && " · loading repositories from GitHub…"}
        </p>
        <div className="mt-5">
          <StatisticsOverview stats={stats} focus={focus} onFocus={setFocus} />
        </div>
        {projects.length === 0 && <p role="status" className="mt-4 text-[13px] text-black/50">No projects match.</p>}
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => useWindowStore.getState().openProject(p.id)}
                aria-label={`Open project ${p.title}`}
                className="flex size-full items-start gap-3 rounded-xl border border-black/10 bg-surface-2 p-4 text-left outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                <ProjectIcon className="size-9 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-black/90">{p.title}</span>
                  <span className="block text-[11px] text-black/45">{p.categories.map(categoryName).join(", ")}</span>
                  {p.shortDescription && <span className="mt-1 line-clamp-3 block text-[12px] text-black/65">{p.shortDescription}</span>}
                  {/* Tags come from the verified classification, so they match the statistics above. */}
                  {(stats.byProject.get(p.id)?.categories.length ?? 0) > 0 && (
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {stats.byProject.get(p.id)!.categories.map((id) => (
                        <span key={id} className="rounded bg-black/[0.06] px-1.5 py-0.5 text-[10px] text-black/60">
                          {getStatCategory(id)?.tag}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
