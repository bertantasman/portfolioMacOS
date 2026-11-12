"use client";

import { useState } from "react";
import { STAT_CATEGORIES, type DeveloperStatistics } from "@/lib/projects/statistics";
import { sameFocus, type StatFocus } from "../lib/focus";

interface StatisticsOverviewProps {
  stats: DeveloperStatistics;
  focus: StatFocus | null;
  onFocus: (focus: StatFocus | null) => void;
  /** Also list the technologies used, with how many projects use each. */
  showTechnologies?: boolean;
}

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-(--accent)";
const card = (active: boolean) =>
  `rounded-lg border px-3 py-2 text-left ${focusRing} ${active ? "border-(--link-color) bg-(--link-color)/10" : "border-black/10 bg-raised/60 hover:bg-black/[0.04]"}`;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * A compact, recruiter-readable summary of the public GitHub projects. Only categories that have projects
 * appear. Cards are filters: selecting one narrows the project list, and selecting it again clears it.
 */
export function StatisticsOverview({ stats, focus, onFocus, showTechnologies = false }: StatisticsOverviewProps) {
  const { scope } = stats;
  const [showAll, setShowAll] = useState(false);
  if (stats.totalProjects === 0 && scope.pending.length === 0) return null;
  const present = STAT_CATEGORIES.filter((c) => stats.categoryCounts[c.id] > 0);
  const cards = present.filter((c) => c.group !== "framework");
  const frameworks = present.filter((c) => c.group === "framework");
  const toggle = (next: StatFocus) => onFocus(sameFocus(focus, next) ? null : next);
  const top = showAll ? stats.technologies : stats.technologies.slice(0, 8);

  return (
    <section aria-label="Developer overview" className="mb-4">
      <h2 className="mb-2 text-[13px] font-semibold text-black/80">Developer Overview</h2>
      <ul className="grid grid-cols-2 gap-2 @[560px]:grid-cols-3 @[760px]:grid-cols-4">
        <li>
          <button type="button" aria-pressed={focus === null} onClick={() => onFocus(null)} className={`${card(focus === null)} block w-full`}>
            <span className="block text-[20px] leading-6 font-semibold text-black/90">{stats.totalProjects}</span>
            <span className="block text-[12px] text-black/60">Total Projects</span>
          </button>
        </li>
        {cards.map((c) => {
          const active = sameFocus(focus, { kind: "category", id: c.id });
          return (
            <li key={c.id}>
              <button type="button" aria-pressed={active} onClick={() => toggle({ kind: "category", id: c.id })} className={`${card(active)} block w-full`}>
                <span className="block text-[20px] leading-6 font-semibold text-black/90">{stats.categoryCounts[c.id]}</span>
                <span className="block text-[12px] text-black/60">{c.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {frameworks.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-black/50">Frameworks</span>
          {frameworks.map((c) => {
            const active = sameFocus(focus, { kind: "category", id: c.id });
            return (
              <button key={c.id} type="button" aria-pressed={active} onClick={() => toggle({ kind: "category", id: c.id })} className={`h-6 rounded-md px-2 text-[12px] @max-[520px]:h-9 @max-[520px]:px-3 ${focusRing} ${active ? "bg-(--link-color) text-white" : "bg-black/[0.06] text-black/70 hover:bg-black/10"}`}>
                {c.tag} <span className="opacity-60">{stats.categoryCounts[c.id]}</span>
              </button>
            );
          })}
        </div>
      )}

      {showTechnologies && top.length > 0 && (
        <div className="mt-3">
          <h3 className="mb-1 text-[12px] font-semibold text-black/60">Technologies Used</h3>
          <ul className="space-y-0.5">
            {top.map((t) => {
              const active = sameFocus(focus, { kind: "technology", name: t.name });
              return (
                <li key={t.name}>
                  <button type="button" aria-pressed={active} onClick={() => toggle({ kind: "technology", name: t.name })} className={`grid w-full grid-cols-[110px_1fr_auto] items-center gap-2 rounded-md px-1.5 py-0.5 text-left text-[12px] @max-[520px]:min-h-9 ${focusRing} ${active ? "bg-(--link-color)/10" : "hover:bg-black/[0.04]"}`}>
                    <span className="truncate text-black/80">{t.name}</span>
                    {/* The bar is this technology's share of all projects, not a slice of a whole: bars overlap by design. */}
                    <span aria-hidden className="h-1.5 rounded-full bg-black/[0.07]">
                      <span className="block h-full rounded-full bg-(--link-color)/70" style={{ width: `${(t.count / stats.totalProjects) * 100}%` }} />
                    </span>
                    <span className="text-black/55 tabular-nums">{plural(t.count, "project", "projects")}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {stats.technologies.length > 8 && (
            <button type="button" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)} className={`mt-1 rounded px-1.5 py-0.5 text-[12px] text-(--link-color) @max-[520px]:min-h-9 ${focusRing}`}>
              {showAll ? "Show fewer" : `Show all ${stats.technologies.length} technologies`}
            </button>
          )}
        </div>
      )}

      <p className="mt-2 text-[11px] leading-4 text-black/45">
        Based on {plural(stats.totalProjects, "public GitHub project", "public GitHub projects")}. A project can appear in several categories.
        {scope.excluded.length > 0 && ` ${plural(scope.excluded.length, "repository is", "repositories are")} not counted (forks, empty or non-project repositories).`}
        {scope.pending.length > 0 && ` ${plural(scope.pending.length, "new repository is", "new repositories are")} waiting to be classified.`}
      </p>
    </section>
  );
}
