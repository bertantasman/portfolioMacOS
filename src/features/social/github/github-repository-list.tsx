"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { ExternalLink, GitFork, Star } from "lucide-react";
import type { GitHubRepository } from "@/lib/github/types";

export interface RepositoryRow {
  repository: GitHubRepository;
  /** The Project Viewer id for this repository (a curated project when one is linked). */
  projectId: string;
  categoryName: string;
  featured: boolean;
  /** The description every app shows: curated tagline when there is one, else GitHub's own. */
  summary: string;
}

const dateFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { year: "numeric", month: "short", day: "numeric" });

interface ListProps {
  rows: readonly RepositoryRow[];
  onOpenProject: (projectId: string) => void;
}

/** One row per real repository. The name opens the Project Viewer; the icon opens GitHub in a new tab. */
export function GitHubRepositoryList({ rows, onOpenProject }: ListProps) {
  return (
    <ul className="divide-y divide-black/[0.08] rounded-lg border border-black/10">
      {rows.map(({ repository: r, projectId, categoryName, featured, summary }) => (
        <li key={r.id} className="flex items-start gap-2 px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <button
                type="button"
                onClick={() => onOpenProject(projectId)}
                aria-label={`Open ${r.name} in Project Viewer`}
                className="max-w-full truncate rounded py-1 text-left text-[14px] font-semibold text-(--link-color) outline-none @max-[520px]:min-h-9 hover:underline focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                {r.name}
              </button>
              {featured && <span className="rounded-full bg-(--accent)/10 px-2 py-px text-[11px] text-(--accent)">Featured</span>}
              {r.isFork && <span className="rounded-full border border-black/15 px-2 py-px text-[11px] text-black/55">Fork</span>}
              {r.isArchived && <span className="rounded-full border border-[#dea123]/60 px-2 py-px text-[11px] text-[#9a6a00]">Archived</span>}
            </div>
            {summary && <p className="mt-1 line-clamp-2 max-w-[70ch] text-[13px] text-black/65">{summary}</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-black/55">
              {r.primaryLanguage && (
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden className="size-2.5 rounded-full bg-(--accent)" />
                  {r.primaryLanguage}
                </span>
              )}
              <span className="inline-flex items-center gap-1" aria-label={`${r.stars} stars`}>
                <Star className="size-3.5" aria-hidden />
                {r.stars}
              </span>
              <span className="inline-flex items-center gap-1" aria-label={`${r.forks} forks`}>
                <GitFork className="size-3.5" aria-hidden />
                {r.forks}
              </span>
              <span>Updated {dateFormat.format(new Date(r.updatedAt))}</span>
              <span className="text-black/40">{categoryName}</span>
            </div>
          </div>
          <a
            href={r.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${r.fullName} on GitHub (opens in a new tab)`}
            className="grid size-7 shrink-0 place-items-center rounded-md text-black/50 outline-none @max-[520px]:size-10 hover:bg-black/[0.06] hover:text-black/80 focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
