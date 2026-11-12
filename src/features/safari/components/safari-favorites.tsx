import { safariFavorites, type SafariFavorite } from "../config/safari-favorites";
import { routeAddress, routeTitle, type SafariRoute } from "../config/safari-routes";
import { FavoriteIcon } from "./safari-favorite-icon";

interface SafariFavoritesProps {
  onOpenFavorite: (favorite: SafariFavorite) => void;
}

export function SafariFavorites({ onOpenFavorite }: SafariFavoritesProps) {
  if (safariFavorites.length === 0) return null;
  return (
    <section aria-labelledby="safari-start-favorites">
      <h2 id="safari-start-favorites" className="mb-3 text-[17px] font-semibold text-black/80">
        Favorites
      </h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-4">
        {safariFavorites.map((fav) => (
          <li key={fav.id}>
            <button
              type="button"
              onClick={() => onOpenFavorite(fav)}
              className="group flex w-[84px] flex-col items-center gap-1.5 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              <FavoriteIcon icon={fav.icon} className="size-16 transition-[filter] group-hover:brightness-95 group-active:brightness-90" />
              <span className="max-w-full truncate text-[12px] text-black/75">{fav.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SafariFrequentlyVisited({
  visits,
  onOpenRoute,
}: {
  visits: Readonly<Partial<Record<SafariRoute, number>>>;
  onOpenRoute: (route: SafariRoute) => void;
}) {
  const entries = (Object.entries(visits) as [SafariRoute, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="safari-start-frequent">
      <h2 id="safari-start-frequent" className="mb-3 text-[17px] font-semibold text-black/80">
        Frequently Visited
      </h2>
      <ul className="flex flex-wrap gap-3">
        {entries.map(([route, count]) => (
          <li key={route}>
            <button
              type="button"
              onClick={() => onOpenRoute(route)}
              className="flex w-[150px] flex-col gap-0.5 rounded-xl bg-raised/80 px-3 py-2.5 text-left shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] outline-none hover:bg-raised focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              <span className="truncate text-[13px] font-medium text-black/80">{routeTitle(route)}</span>
              <span className="truncate text-[11px] text-black/45">{routeAddress(route)}</span>
              <span className="text-[11px] text-black/45">
                {count} {count === 1 ? "visit" : "visits"} this session
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
