"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProjectIcon } from "@/components/file-icons";
import { ProjectCaseSection, ProjectCollaboration, ProjectCurrentStatus, ProjectEngineering, ProjectExperience, ProjectRole, ProjectSummary } from "@/features/project-viewer/components/project-case-study";
import { ProjectDetails } from "@/features/project-viewer/components/project-details";
import { ProjectFeatures } from "@/features/project-viewer/components/project-features";
import { ProjectHeader } from "@/features/project-viewer/components/project-header";
import { ProjectOverview } from "@/features/project-viewer/components/project-overview";
import { ProjectRepository } from "@/features/project-viewer/components/project-repository";
import { ProjectStory } from "@/features/project-viewer/components/project-story";
import { ProjectTechnologies } from "@/features/project-viewer/components/project-technologies";
import { useProjectViewer } from "@/features/project-viewer/hooks/use-project-viewer";
import { getStatusLabel } from "@/features/project-viewer/utils/project-utils";
import { categoryName, selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import type { PortfolioProject } from "@/types/project";
import { useMobileStore } from "../store/mobile-store";
import { AppScreen } from "../components/app-screen";
import { useStack } from "./use-stack";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${active ? "bg-(--accent) text-(--accent-fg)" : "bg-black/[0.07] text-black/75"}`}>
      {children}
    </button>
  );
}

function ProjectCard({ project, onOpen }: { project: PortfolioProject; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex min-h-[72px] w-full items-start gap-3 rounded-2xl border border-black/10 bg-surface-2 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent) active:bg-black/[0.05]">
        <ProjectIcon className="size-12 shrink-0" category={project.categories[0]} />
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-semibold text-black/90">{project.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-[18px] text-black/65">{project.tagline ?? project.shortDescription}</span>
          <span className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-black/55">
            {project.categories[0] && <span className="rounded-full bg-black/[0.06] px-2 py-0.5">{categoryName(project.categories[0])}</span>}
            {project.status && <span className="rounded-full bg-black/[0.06] px-2 py-0.5">{getStatusLabel(project.status)}</span>}
          </span>
        </span>
      </button>
    </li>
  );
}

function ProjectList() {
  const registry = useProjectRegistry();
  const pushScreen = useMobileStore((s) => s.pushScreen);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const projects = registry.projects;
  const categories = useMemo(() => [...new Set(projects.flatMap((p) => p.categories))], [projects]);
  const statuses = useMemo(() => [...new Set(projects.flatMap((p) => (p.status ? [p.status] : [])))], [projects]);
  const q = query.trim().toLowerCase();
  const filtering = q !== "" || category !== null || status !== null;
  const matches = projects.filter(
    (p) =>
      (!category || p.categories.includes(category as never)) &&
      (!status || p.status === status) &&
      (!q || `${p.title} ${p.shortDescription} ${p.tagline ?? ""} ${(p.technologies ?? []).join(" ")}`.toLowerCase().includes(q)),
  );
  const featured = selectFeatured(registry, 6);
  const open = (p: PortfolioProject) => pushScreen(p.id);

  return (
    <AppScreen title="Projects">
      <label className="flex h-11 items-center gap-2 rounded-xl bg-black/[0.06] px-3 focus-within:ring-2 focus-within:ring-(--accent)">
        <Search className="size-4 text-black/50" aria-hidden />
        <span className="sr-only">Search projects</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="min-w-0 flex-1 bg-transparent text-[16px] text-black outline-none placeholder:text-black/45" />
      </label>
      <div role="group" aria-label="Filter by category" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={category === null} onClick={() => setCategory(null)}>All</Chip>
        {categories.map((c) => <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{categoryName(c)}</Chip>)}
      </div>
      {statuses.length > 1 && (
        <div role="group" aria-label="Filter by status" className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(status === s ? null : s)}>{getStatusLabel(s)}</Chip>)}
        </div>
      )}

      {filtering ? (
        <section aria-label="Results" className="mt-4">
          <p role="status" className="mb-2 text-[13px] text-black/55">{matches.length} {matches.length === 1 ? "project" : "projects"}</p>
          {matches.length === 0 ? <p className="py-8 text-center text-[14px] text-black/55">No projects match. Clear a filter to see more.</p> : <ul className="space-y-2.5">{matches.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => open(p)} />)}</ul>}
        </section>
      ) : (
        <>
          {featured.configured && (
            <section aria-labelledby="featured" className="mt-4">
              <h2 id="featured" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Featured</h2>
              <ul className="space-y-2.5">{featured.projects.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => open(p)} />)}</ul>
            </section>
          )}
          <section aria-labelledby="all" className="mt-5">
            <h2 id="all" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">All projects ({projects.length})</h2>
            <ul className="space-y-2.5">{projects.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => open(p)} />)}</ul>
          </section>
        </>
      )}
    </AppScreen>
  );
}

function ProjectDetailScreen({ id }: { id: string }) {
  const data = useProjectViewer(id);
  const openApp = useMobileStore((s) => s.openApp);
  const prefix = useId().replace(/:/g, "");
  const a = (name: string) => `${prefix}-${name}`;
  if (!data) {
    return (
      <AppScreen title="Project" backLabel="Projects">
        <p role="status" className="py-10 text-center text-[14px] text-black/60">This project isn’t available.</p>
      </AppScreen>
    );
  }
  const { detail } = data;
  const { repository } = data.project;
  const cs = detail.caseStudy;
  const hasOverview = detail.overview.length > 0 || detail.problem.length > 0 || detail.solution.length > 0;
  const hasDetails = detail.technicalDetails.length + detail.challenges.length + detail.responsibilities.length + detail.outcomes.length > 0;
  return (
    <AppScreen title={detail.title} backLabel="Projects">
      <div className="space-y-6 pb-6 text-black">
        <ProjectHeader detail={detail} />
        {cs?.summary && <ProjectSummary summary={cs.summary} />}
        {hasOverview && <ProjectOverview id={a("overview")} overview={detail.overview} problem={detail.problem} solution={detail.solution} />}
        {cs?.origin && <ProjectStory id={a("origin")} story={cs.origin} />}
        {cs?.role && <ProjectRole id={a("role")} role={cs.role} />}
        {cs && (cs.userExperience || cs.audiences || cs.journeys) && <ProjectExperience id={a("experience")} caseStudy={cs} />}
        {detail.features.length > 0 && <ProjectFeatures id={a("features")} features={detail.features} />}
        {detail.technologies.length > 0 && <ProjectTechnologies id={a("technologies")} groups={detail.technologies} />}
        {cs && (cs.architecture || cs.highlights) && <ProjectEngineering id={a("engineering")} caseStudy={cs} />}
        {cs?.sections?.map((s) => <ProjectCaseSection key={s.id} id={a(`s-${s.id}`)} section={s} />)}
        {cs?.collaboration && <ProjectCollaboration id={a("team")} collaboration={cs.collaboration} />}
        {cs?.challenge && <ProjectStory id={a("challenge")} story={cs.challenge} />}
        {cs?.reflection && <ProjectStory id={a("reflection")} story={cs.reflection} />}
        {detail.personalStory && <ProjectStory id={a("story")} story={detail.personalStory} />}
        {cs?.currentStatus && <ProjectCurrentStatus id={a("status")} status={cs.currentStatus} />}
        {detail.screenshots.length > 0 && (
          <section aria-labelledby={a("gallery")}>
            <h2 id={a("gallery")} className="mb-2 text-[17px] font-semibold text-black/90">Gallery</h2>
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {detail.screenshots.map((s) => (
                <li key={s.src} className="shrink-0 snap-center">
                  <button type="button" onClick={() => s.mediaId && openApp("photos", [s.mediaId])} aria-label={`Open screenshot: ${s.alt ?? detail.title}`} className="block overflow-hidden rounded-xl border border-black/10 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">
                    <Image src={s.src} alt={s.alt ?? `${detail.title} screenshot`} width={s.width} height={s.height} sizes="60vw" className="h-[280px] w-auto object-contain" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {hasDetails && <ProjectDetails id={a("details")} detail={detail} />}
        {repository && <ProjectRepository id={a("repository")} repository={repository} />}
      </div>
    </AppScreen>
  );
}

export default function ProjectsApp() {
  const stack = useStack("projects");
  const id = stack[stack.length - 1];
  return id ? <ProjectDetailScreen id={id} /> : <ProjectList />;
}
