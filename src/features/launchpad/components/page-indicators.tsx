"use client";

interface PageIndicatorsProps {
  count: number;
  page: number;
  onSelect: (page: number) => void;
}

/** Page dots. Not rendered at all when everything fits on one page. */
export function PageIndicators({ count, page, onSelect }: PageIndicatorsProps) {
  if (count <= 1) return null;
  return (
    <nav aria-label="Launchpad pages" data-launchpad-keep className="flex items-center gap-1">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1} of ${count}`}
          aria-current={i === page ? "page" : undefined}
          onClick={() => onSelect(i)}
          className="grid size-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <span className={`size-2 rounded-full transition-colors ${i === page ? "bg-white" : "bg-white/40 hover:bg-white/65"}`} />
        </button>
      ))}
    </nav>
  );
}
