"use client";

import { useId, useRef } from "react";
import { ProjectIcon } from "@/components/file-icons";
import { WindowDragArea, useWindowChrome } from "@/components/windows/window-chrome";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useWindowStore } from "@/store/window-store";
import { useProjectViewer } from "../hooks/use-project-viewer";
import { ProjectCaseSection, ProjectCollaboration, ProjectCurrentStatus, ProjectEngineering, ProjectExperience, ProjectRole, ProjectSummary } from "./project-case-study";
import { ProjectDetails } from "./project-details";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectFeatures } from "./project-features";
import { ProjectGallery } from "./project-gallery";
import { ProjectHeader } from "./project-header";
import { ProjectMetadata } from "./project-metadata";
import { ProjectOverview } from "./project-overview";
import { ProjectReadme, ProjectRepository } from "./project-repository";
import { ProjectStory } from "./project-story";
import { ProjectSectionNav, type NavItem } from "./project-section-nav";
import { ProjectTechnologies } from "./project-technologies";

/** Shows one project. Reusable: the project comes from the window's payload. */
export function ProjectViewer({ projectId }: { projectId: string }) {
  const data = useProjectViewer(projectId);
  const { onClose } = useWindowChrome();
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useShouldReduceMotion();
  const prefix = useId().replace(/:/g, "");
  const anchor = (name: string) => `${prefix}-${name}`;

  if (!data) {
    return (
      <div className="relative flex size-full flex-col text-black">
        <WindowDragArea className="h-[52px] shrink-0 border-b border-black/10 bg-surface/80" />
        <div className="min-h-0 flex-1 bg-surface/90">
          <ProjectEmptyState message="This project isn’t available." onClose={onClose} />
        </div>
      </div>
    );
  }

  const { project, detail, metadata } = data;
  const { repository } = project;
  const hasOverview = detail.overview.length > 0 || detail.problem.length > 0 || detail.solution.length > 0;
  const cs = detail.caseStudy;
  const hasDetails = detail.technicalDetails.length + detail.challenges.length + detail.responsibilities.length + detail.outcomes.length > 0;

  // Only sections that have something to show get a place in the navigation.
  const nav: NavItem[] = [
    ...(hasOverview ? [{ id: anchor("overview"), label: "Overview" }] : []),
    ...(cs?.origin ? [{ id: anchor("origin"), label: "How It Started" }] : []),
    ...(cs?.role ? [{ id: anchor("role"), label: "My Role" }] : []),
    ...(cs?.userExperience || cs?.audiences || cs?.journeys ? [{ id: anchor("experience"), label: "User Experience" }] : []),
    ...(detail.features.length > 0 ? [{ id: anchor("features"), label: "Features" }] : []),
    ...(detail.technologies.length > 0 ? [{ id: anchor("technologies"), label: "Technologies" }] : []),
    ...(cs?.architecture || cs?.highlights ? [{ id: anchor("engineering"), label: "Architecture" }] : []),
    ...(cs?.sections ?? []).map((s) => ({ id: anchor(`s-${s.id}`), label: s.label ?? s.title })),
    ...(cs?.collaboration ? [{ id: anchor("team"), label: "Building Together" }] : []),
    ...(cs?.challenge ? [{ id: anchor("challenge"), label: "The Challenge" }] : []),
    ...(cs?.reflection ? [{ id: anchor("reflection"), label: "What I Learned" }] : []),
    ...(detail.personalStory ? [{ id: anchor("story"), label: "What It Means" }] : []),
    ...(cs?.currentStatus ? [{ id: anchor("status"), label: "Current Status" }] : []),
    ...(detail.screenshots.length > 0 ? [{ id: anchor("gallery"), label: "Gallery" }] : []),
    ...(hasDetails ? [{ id: anchor("details"), label: "Technical Details" }] : []),
    ...(repository ? [{ id: anchor("repository"), label: "Repository" }, { id: anchor("readme"), label: "README" }] : []),
  ];

  const jump = (id: string) => {
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!container || !target) return;
    // Scroll only this window's content (scrollIntoView could move the whole window).
    const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 44;
    container.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    target.focus?.({ preventScroll: true });
  };

  return (
    <div className="@container relative flex size-full flex-col text-black">
      <WindowDragArea className="flex h-[52px] shrink-0 items-center gap-2 border-b border-black/10 bg-surface/80 pr-4 pl-[84px]">
        <ProjectIcon className="size-5 shrink-0" />
        <span className="min-w-0 truncate text-[13px] font-semibold text-black/85">{detail.title}</span>
        <span className="min-w-0 truncate text-[12px] text-black/45 @max-[560px]:hidden">{detail.categoryNames.join(", ")}</span>
      </WindowDragArea>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-surface/90">
        <div className="mx-auto max-w-[760px] space-y-6 px-6 pb-8">
          <div className="pt-5">
            <ProjectHeader detail={detail} />
          </div>
          {cs?.summary && <ProjectSummary summary={cs.summary} />}
          <ProjectSectionNav items={nav} onSelect={jump} />
          {hasOverview && <ProjectOverview id={anchor("overview")} overview={detail.overview} problem={detail.problem} solution={detail.solution} />}
          {cs?.origin && <ProjectStory id={anchor("origin")} story={cs.origin} />}
          {cs?.role && <ProjectRole id={anchor("role")} role={cs.role} />}
          {cs && (cs.userExperience || cs.audiences || cs.journeys) && <ProjectExperience id={anchor("experience")} caseStudy={cs} />}
          {detail.features.length > 0 && <ProjectFeatures id={anchor("features")} features={detail.features} />}
          {detail.technologies.length > 0 && <ProjectTechnologies id={anchor("technologies")} groups={detail.technologies} />}
          {cs && (cs.architecture || cs.highlights) && <ProjectEngineering id={anchor("engineering")} caseStudy={cs} />}
          {cs?.sections?.map((s) => <ProjectCaseSection key={s.id} id={anchor(`s-${s.id}`)} section={s} />)}
          {cs?.collaboration && <ProjectCollaboration id={anchor("team")} collaboration={cs.collaboration} />}
          {cs?.challenge && <ProjectStory id={anchor("challenge")} story={cs.challenge} />}
          {cs?.reflection && <ProjectStory id={anchor("reflection")} story={cs.reflection} />}
          {detail.personalStory && <ProjectStory id={anchor("story")} story={detail.personalStory} />}
          {cs?.currentStatus && <ProjectCurrentStatus id={anchor("status")} status={cs.currentStatus} />}
          {detail.screenshots.length > 0 && (
            <ProjectGallery
              id={anchor("gallery")}
              title={detail.title}
              screenshots={detail.screenshots}
              onOpenInPhotos={(mediaId) => useWindowStore.getState().openMedia(mediaId)}
            />
          )}
          {hasDetails && <ProjectDetails id={anchor("details")} detail={detail} />}
          <ProjectMetadata rows={metadata} />
          {repository && <ProjectRepository id={anchor("repository")} repository={repository} />}
          {repository && <ProjectReadme id={anchor("readme")} repository={repository} />}
        </div>
      </div>
    </div>
  );
}
