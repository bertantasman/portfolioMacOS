import type { SafariFavorite } from "../config/safari-favorites";
import type { SafariRoute } from "../config/safari-routes";
import { SafariFavorites, SafariFrequentlyVisited } from "./safari-favorites";

interface SafariStartPageProps {
  visits: Readonly<Partial<Record<SafariRoute, number>>>;
  onOpenFavorite: (favorite: SafariFavorite) => void;
  onOpenRoute: (route: SafariRoute) => void;
}

export function SafariStartPage({ visits, onOpenFavorite, onOpenRoute }: SafariStartPageProps) {
  return (
    <div className="min-h-full bg-[image:var(--start-gradient)] px-8 py-8">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">
        <SafariFavorites onOpenFavorite={onOpenFavorite} />
        <SafariFrequentlyVisited visits={visits} onOpenRoute={onOpenRoute} />
      </div>
    </div>
  );
}
