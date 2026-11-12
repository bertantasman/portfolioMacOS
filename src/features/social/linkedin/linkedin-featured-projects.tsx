import { getMediaByProjectId } from "@/data/media";
import { selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import { PhotoImage } from "@/features/photos/components/photo-image";
import { Card } from "./linkedin-sections";

/** The featured projects from the shared registry; without a featured configuration, the same "recent work" fallback as the widget. */
export function LinkedInFeaturedProjects({ onOpenProject }: { onOpenProject: (projectId: string) => void }) {
  const { projects: list, configured } = selectFeatured(useProjectRegistry(), 6);
  if (list.length === 0) return null;

  return (
    <Card title={configured ? "Featured Projects" : "Projects"}>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {list.map((p) => {
          const image = getMediaByProjectId(p.id)[0];
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onOpenProject(p.id)}
                aria-label={`Open project ${p.title}`}
                className="block h-full w-full overflow-hidden rounded-lg border border-black/10 bg-surface text-left outline-none hover:border-black/25 focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                {image && (
                  <span className="relative block aspect-[16/9] bg-black/[0.05]">
                    <PhotoImage media={image} thumbnail fill sizes="240px" className="object-cover" />
                  </span>
                )}
                <span className="block p-3">
                  <span className="block text-[13px] font-semibold text-black/90">{p.title}</span>
                  <span className="mt-0.5 line-clamp-3 block text-[12px] text-black/60">{p.shortDescription}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
