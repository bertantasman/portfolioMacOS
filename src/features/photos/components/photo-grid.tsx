import type { PortfolioMedia } from "@/types/media";
import { PhotoImage } from "./photo-image";

interface PhotoGridProps {
  label: string;
  items: readonly PortfolioMedia[];
  thumbnailPx: number;
  onOpen: (mediaId: string) => void;
}

/** Square-cropped thumbnails in a tight grid, like Photos. The full image keeps its ratio in the detail view. */
export function PhotoGrid({ label, items, thumbnailPx, onOpen }: PhotoGridProps) {
  return (
    <ul
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailPx}px, 1fr))` }}
      className="grid content-start gap-0.5 p-0.5 transition-[grid-template-columns] motion-reduce:transition-none"
    >
      {items.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            aria-label={m.title}
            onClick={() => onOpen(m.id)}
            className="group relative block aspect-square w-full overflow-hidden bg-black/[0.05] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-inset"
          >
            <PhotoImage
              media={m}
              thumbnail
              fill
              sizes={`${thumbnailPx * 2}px`}
              className="object-cover transition-[filter] group-hover:brightness-95"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
