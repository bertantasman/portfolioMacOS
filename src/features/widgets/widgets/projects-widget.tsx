"use client";

import { ProjectIcon } from "@/components/file-icons";
import { openProjectById } from "@/lib/navigation";
import { categoryName, selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import type { WidgetProps } from "../types/widgets";


/** Shortcuts to the real projects in the registry; each opens its Project Viewer window. */
export function ProjectsWidget({ size, preview }: WidgetProps) {
  // Featured projects when any are configured; otherwise a clearly separate fallback (no ranking is invented).
  const registry = useProjectRegistry();
  const { projects: ordered, configured } = selectFeatured(registry, size === "large" ? 6 : size === "medium" ? 3 : 1);
  if (ordered.length === 0) {
    return <p className="grid size-full place-items-center p-4 text-center text-[12px] text-black/45">No projects yet.</p>;
  }
  const tab = preview ? -1 : 0;

  if (size === "small") {
    const p = ordered[0];
    return (
      <button type="button" tabIndex={tab} aria-label={`Open project ${p.title}`} onClick={() => openProjectById(p.id)} className="flex size-full flex-col items-start justify-between rounded-[inherit] p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">
        <ProjectIcon className="size-9" />
        <span>
          <span className="block text-[11px] text-black/45">{p.categories.map(categoryName)[0] ?? "Project"}</span>
          <span className="line-clamp-2 text-[15px] leading-tight font-semibold text-black/90">{p.title}</span>
        </span>
      </button>
    );
  }

  return (
    <div className={`flex size-full flex-col ${size === "large" ? "p-4" : "p-3"}`}>
      <h3 className="mb-1 px-1 text-[11px] font-semibold tracking-wide text-(--accent) uppercase">{configured ? "Featured Projects" : "Projects"}</h3>
      <ul className="min-h-0 flex-1 overflow-hidden">
        {ordered.map((p) => (
          <li key={p.id}>
            <button type="button" tabIndex={tab} aria-label={`Open project ${p.title}`} onClick={() => openProjectById(p.id)} className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-0.5 text-left outline-none hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-(--accent)">
              <ProjectIcon className="size-6 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-[13px] leading-4 font-medium text-black/90">{p.title}</span>
                {size === "large" ? (
                  <span className="line-clamp-2 text-[11px] text-black/55">{p.shortDescription}</span>
                ) : (
                  <span className="block truncate text-[10px] leading-3 text-black/45">{p.categories.map(categoryName).join(", ")}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
