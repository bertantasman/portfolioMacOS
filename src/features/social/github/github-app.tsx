"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { profile } from "@/data/profile";
import { categoryName, useProjectRegistry } from "@/lib/projects/registry";
import { useDeveloperStatistics } from "@/lib/projects/use-statistics";
import { StatisticsOverview } from "@/features/statistics/components/statistics-overview";
import { matchesFocus, type StatFocus } from "@/features/statistics/lib/focus";
import { useGitHubProfileStore } from "@/store/github-profile-store";
import { useRepositoryStore } from "@/store/repository-store";
import { useWindowStore } from "@/store/window-store";
import { ExternalProfileButton } from "../components/external-profile-button";
import { ProfileAvatar } from "../components/profile-avatar";
import { SocialEmptyState } from "../components/social-empty-state";
import { getShortBio } from "@/lib/profile/selectors";
import { getProfileLink } from "../utils/social-links";
import { GitHubProjectCard } from "./github-project-card";
import { GitHubRepositoryList, type RepositoryRow } from "./github-repository-list";

type TypeFilter = "all" | "original" | "forked" | "archived";
type Sort = "updated" | "created" | "stars" | "name";

const PAGE = 24;
const timeFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { hour: "numeric", minute: "2-digit" });

const openProject = (projectId: string) => useWindowStore.getState().openProject(projectId);

const chip = (active: boolean) =>
  `h-6 shrink-0 rounded-[5px] px-3 text-[12px] font-medium @max-[520px]:h-9 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${active ? "bg-(--link-color) text-white" : "text-black/65 hover:bg-black/[0.05]"}`;

/**
 * The GitHub application: the real public repositories of the configured account, from the shared repository
 * store (one request for the whole portfolio). It is not an authenticated GitHub session.
 */
export function GitHubApp() {
  const link = getProfileLink("github");
  const bio = getShortBio();
  const status = useRepositoryStore((s) => s.status);
  const repositories = useRepositoryStore((s) => s.repositories);
  const error = useRepositoryStore((s) => s.error);
  const stale = useRepositoryStore((s) => s.stale);
  const truncated = useRepositoryStore((s) => s.truncated);
  const fetchedAt = useRepositoryStore((s) => s.fetchedAt);
  const refreshing = useRepositoryStore((s) => s.refreshing);
  const username = useRepositoryStore((s) => s.username);
  const load = useRepositoryStore((s) => s.load);
  const refresh = useRepositoryStore((s) => s.refresh);
  const registry = useProjectRegistry();
  // GitHub's own profile data (avatar, name, bio, repository count). Without it the portfolio profile fills in.
  const gh = useGitHubProfileStore((s) => s.profile);
  const loadProfile = useGitHubProfileStore((s) => s.load);
  const stats = useDeveloperStatistics();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("updated");
  // A category or technology picked in the overview. It narrows the list together with search and the filters below.
  const [focus, setFocus] = useState<StatFocus | null>(null);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    void load();
    void loadProfile();
  }, [load, loadProfile]);

  // Each repository paired with the project it maps to. Computed once per refresh, not per keystroke.
  const rows = useMemo<RepositoryRow[]>(
    () =>
      repositories.flatMap((repository) => {
        const projectId = registry.projectIdByRepositoryId.get(repository.id);
        const project = projectId ? registry.byId.get(projectId) : undefined;
        return projectId && project ? [{ repository, projectId, categoryName: categoryName(project.categories[0] ?? "other"), featured: project.featured === true, summary: project.shortDescription }] : [];
      }),
    [repositories, registry],
  );

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const id = registry.byId.get(row.projectId)?.categories[0] ?? "other";
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()].map(([id, count]) => ({ id, label: categoryName(id), count }));
  }, [rows, registry]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(({ repository: r, projectId, featured }) => {
      if (type === "original" && (r.isFork || r.isArchived)) return false;
      if (type === "forked" && !r.isFork) return false;
      if (type === "archived" && !r.isArchived) return false;
      if (!matchesFocus(stats, projectId, focus)) return false;
      if (category === "featured" ? !featured : category !== "all" && registry.byId.get(projectId)?.categories[0] !== category) return false;
      if (!q) return true;
      return [r.name, r.description ?? "", r.primaryLanguage ?? "", ...r.topics].some((field) => field.toLowerCase().includes(q));
    });
    const sorters: Record<Sort, (a: RepositoryRow, b: RepositoryRow) => number> = {
      updated: (a, b) => Date.parse(b.repository.updatedAt) - Date.parse(a.repository.updatedAt),
      created: (a, b) => Date.parse(b.repository.createdAt) - Date.parse(a.repository.createdAt),
      stars: (a, b) => b.repository.stars - a.repository.stars || a.repository.name.localeCompare(b.repository.name),
      name: (a, b) => a.repository.name.localeCompare(b.repository.name, undefined, { sensitivity: "base" }),
    };
    return [...list].sort(sorters[sort]);
  }, [rows, query, category, type, sort, registry, stats, focus]);

  // Curated projects that are not on GitHub stay visible, labelled as such.
  // Under a statistics filter they drop out: they have no verified classification to match.
  const offGitHub = registry.projects.filter((p) => p.source === "curated" && !p.repository && matchesFocus(stats, p.id, focus));
  const hasFeatured = rows.some((r) => r.featured);
  const shown = filtered.slice(0, visible);
  const loading = status === "idle" || status === "loading";

  const reset = () => setVisible(PAGE);

  return (
    <div className="@container size-full overflow-y-auto bg-surface text-black">
      <header className="border-b border-black/10 bg-surface-2 px-6 py-5">
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center gap-4">
          <ProfileAvatar name={gh?.name ?? profile.fullName ?? profile.displayName} src={gh?.avatarUrl ?? profile.avatar} className="size-[72px] text-[22px]" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] leading-6 font-semibold">{gh?.name ?? profile.fullName ?? profile.displayName}</h1>
            {(gh?.login ?? username ?? link?.username) && <p className="text-[14px] text-black/50">{gh?.login ?? username ?? link?.username}</p>}
            {/* GitHub's own bio when it has one; otherwise the portfolio's. */}
            {gh ? gh.bio && <p className="mt-0.5 max-w-[60ch] text-[13px] text-black/70">{gh.bio}</p> : profile.headline && <p className="mt-0.5 text-[13px] text-black/70">{profile.headline}</p>}
            {!gh && bio && <p className="mt-1 max-w-[60ch] text-[13px] text-black/60">{bio}</p>}
            {gh && <p className="mt-1 text-[12px] text-black/50">{gh.publicRepos} public {gh.publicRepos === 1 ? "repository" : "repositories"} on GitHub</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <ExternalProfileButton url={link?.url ?? (username ? `https://github.com/${username}` : undefined)} label="Open GitHub Profile" className="bg-[#2da44e] text-white hover:bg-[#2c974b]" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[820px] px-6 py-5">
        {loading ? (
          <p role="status" className="py-10 text-center text-[13px] text-black/50">
            Loading repositories from GitHub…
          </p>
        ) : status === "error" ? (
          <div role="alert" className="rounded-lg border border-black/10 bg-surface-2 p-5 text-center">
            <p className="text-[14px] font-semibold text-black/85">
              {error?.reason === "not-configured" ? "GitHub isn’t set up yet" : error?.reason === "rate-limited" ? "GitHub’s rate limit was reached" : "Repositories couldn’t be loaded"}
            </p>
            <p className="mx-auto mt-1 max-w-[52ch] text-[13px] text-black/60">{error?.message}</p>
            {error?.reason !== "not-configured" && error?.reason !== "invalid-username" && (
              <button type="button" onClick={() => void refresh()} className="mt-3 h-7 rounded-md bg-black/[0.07] px-3 text-[13px] text-black/80 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)">
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-black/50" role="status">
              <span>
                {rows.length} {rows.length === 1 ? "repository" : "repositories"}
              </span>
              {fetchedAt && <span>Updated {timeFormat.format(new Date(fetchedAt))}</span>}
              {stale && <span className="text-[#9a6a00]">GitHub couldn’t be reached; showing the last copy.</span>}
              {truncated && <span className="text-[#9a6a00]">Showing only the first 1,000 repositories.</span>}
              <button type="button" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh repositories" className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-(--link-color) @max-[520px]:min-h-9 outline-none hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-50">
                <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {rows.length === 0 ? (
              <SocialEmptyState title="No Repositories" message="This account has no public repositories." />
            ) : (
              <>
                <StatisticsOverview
                  stats={stats}
                  focus={focus}
                  showTechnologies
                  onFocus={(f) => {
                    setFocus(f);
                    reset();
                  }}
                />
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <label className="relative min-w-[200px] flex-1">
                    <span className="sr-only">Search repositories</span>
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-black/40" aria-hidden />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        reset();
                      }}
                      placeholder="Search name, description, topic or language"
                      className="h-8 w-full rounded-md border border-black/15 bg-raised/60 pr-2 pl-8 text-[13px] outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-(--accent)"
                    />
                  </label>
                  <label className="text-[12px] text-black/55">
                    <span className="sr-only">Sort repositories</span>
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value as Sort);
                        reset();
                      }}
                      className="h-8 rounded-md border border-black/15 bg-raised/60 px-2 text-[12px] text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                    >
                      <option value="updated">Recently updated</option>
                      <option value="created">Recently created</option>
                      <option value="stars">Most starred</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </label>
                </div>

                <div role="group" aria-label="Filter by category" className="mb-2 flex max-w-full gap-0.5 overflow-x-auto rounded-md border border-black/15 bg-raised/60 p-0.5">
                  <button type="button" aria-pressed={category === "all"} onClick={() => { setCategory("all"); reset(); }} className={chip(category === "all")}>All</button>
                  {hasFeatured && (
                    <button type="button" aria-pressed={category === "featured"} onClick={() => { setCategory("featured"); reset(); }} className={chip(category === "featured")}>Featured</button>
                  )}
                  {categories.map((c) => (
                    <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => { setCategory(c.id); reset(); }} className={chip(category === c.id)}>
                      {c.label} <span className="opacity-60">{c.count}</span>
                    </button>
                  ))}
                </div>
                <div role="group" aria-label="Filter by type" className="mb-4 inline-flex gap-0.5 rounded-md border border-black/15 bg-raised/60 p-0.5">
                  {(["all", "original", "forked", "archived"] as const).map((t) => (
                    <button key={t} type="button" aria-pressed={type === t} onClick={() => { setType(t); reset(); }} className={chip(type === t)}>
                      {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <SocialEmptyState title="No Matches" message="No repositories match your search and filters." />
                ) : (
                  <>
                    <p className="sr-only" role="status">
                      {filtered.length} matching repositories
                    </p>
                    <GitHubRepositoryList rows={shown} onOpenProject={openProject} />
                    {filtered.length > shown.length && (
                      <div className="mt-3 text-center">
                        <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="h-8 rounded-md bg-black/[0.07] px-4 text-[13px] text-black/80 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)">
                          Show more ({filtered.length - shown.length} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {offGitHub.length > 0 && (
          <section aria-labelledby="gh-off" className="mt-6">
            <h2 id="gh-off" className="mb-2 text-[12px] font-semibold tracking-wide text-black/45 uppercase">
              Portfolio projects (not on GitHub)
            </h2>
            <ul className="grid gap-2 @[560px]:grid-cols-2">
              {offGitHub.map((p) => (
                <li key={p.id}>
                  <GitHubProjectCard project={p} onOpenProject={openProject} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
