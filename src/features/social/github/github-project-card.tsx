import { ExternalLink } from "lucide-react";
import { projectCategories } from "@/data/project-categories";
import { safeHttpUrl } from "@/lib/safe-url";
import type { PortfolioProject } from "@/types/project";

interface GitHubProjectCardProps {
  project: PortfolioProject;
  onOpenProject: (projectId: string) => void;
}

const categoryName = (id: string) => projectCategories.find((c) => c.id === id)?.name ?? id;

/** A repository-style card. The title opens the project here; only "View Repository" leaves the desktop. */
export function GitHubProjectCard({ project, onOpenProject }: GitHubProjectCardProps) {
  const repoUrl = safeHttpUrl(project.githubUrl);
  return (
    <article className="rounded-md border border-black/15 bg-raised/60 p-4">
      <h3 className="text-[15px] font-semibold">
        <button
          type="button"
          onClick={() => onOpenProject(project.id)}
          aria-label={`Open project ${project.title}`}
          className="rounded text-left text-(--link-color) outline-none hover:underline focus-visible:ring-2 focus-visible:ring-(--accent)"
        >
          {project.title}
        </button>
      </h3>
      <p className="mt-1 text-[13px] text-black/65">{project.shortDescription}</p>

      {project.technologies && project.technologies.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.map((t) => (
            <li key={t} className="rounded-full bg-(--link-color)/10 px-2 py-0.5 text-[11px] font-medium text-(--link-color)">
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-black/50">
        {project.categories.length > 0 && <span>{project.categories.map(categoryName).join(", ")}</span>}
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenProject(project.id)}
            className="h-6 rounded-md border border-black/15 bg-raised px-2.5 text-[12px] font-medium text-black/80 outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            Open Project
          </button>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View Repository for ${project.title} (opens in a new tab)`}
              className="inline-flex h-6 items-center gap-1 rounded-md bg-[#2da44e] px-2.5 text-[12px] font-medium text-white outline-none hover:bg-[#2c974b] focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              View Repository
              <ExternalLink className="size-3" aria-hidden />
            </a>
          )}
        </span>
      </div>
    </article>
  );
}
