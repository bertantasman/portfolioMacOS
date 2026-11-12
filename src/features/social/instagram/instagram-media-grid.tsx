import { PhotoImage } from "@/features/photos/components/photo-image";
import type { PortfolioMedia } from "@/types/media";

interface InstagramMediaGridProps {
  items: readonly PortfolioMedia[];
  onOpen: (mediaId: string, trigger: HTMLElement) => void;
}

/** Square thumbnails from the shared media library; lazy-loaded, so no layout shift. */
export function InstagramMediaGrid({ items, onOpen }: InstagramMediaGridProps) {
  return (
    <ul aria-label="Photos" className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1">
      {items.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            aria-label={m.title}
            onClick={(e) => onOpen(m.id, e.currentTarget)}
            className="group relative block aspect-square w-full overflow-hidden bg-black/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-inset"
          >
            <PhotoImage
              media={m}
              thumbnail
              fill
              sizes="200px"
              className="object-cover transition-opacity duration-150 group-hover:opacity-85"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
