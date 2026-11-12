import { getProjectById } from "@/lib/projects/registry";
import type { PortfolioMedia } from "@/types/media";
import { formatDate } from "../lib/format";

/** Shows only the details that exist for the photo. Nothing is invented. */
export function PhotoMetadata({ media }: { media: PortfolioMedia }) {
  const project = media.projectId ? getProjectById(media.projectId) : undefined;
  const rows: { label: string; value: string }[] = [
    { label: "Title", value: media.title },
    ...(media.description ? [{ label: "Description", value: media.description }] : []),
    ...(project ? [{ label: "Project", value: project.title }] : []),
    { label: "Dimensions", value: `${media.width} × ${media.height}` },
    ...(formatDate(media.capturedAt) ? [{ label: "Captured", value: formatDate(media.capturedAt)! }] : []),
    ...(formatDate(media.addedAt) ? [{ label: "Added", value: formatDate(media.addedAt)! }] : []),
  ];

  return (
    <aside aria-label="Photo information" className="w-[240px] shrink-0 overflow-y-auto border-l border-black/10 bg-surface-2 p-3 @max-[640px]:hidden">
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide text-black/45 uppercase">Info</h2>
      <dl className="space-y-2.5 text-[12px]">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-black/45">{label}</dt>
            <dd className="break-words text-black/85">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
