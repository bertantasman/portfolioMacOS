import { safariFavorites, type SafariFavorite } from "../config/safari-favorites";
import { routeTitle } from "../config/safari-routes";
import { currentRoute, type SafariTab } from "../types/safari";
import { FavoriteIcon } from "./safari-favorite-icon";

interface SafariSidebarProps {
  tabs: readonly SafariTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onOpenFavorite: (favorite: SafariFavorite) => void;
}

const row =
  "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-black/85 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent)";

export function SafariSidebar({ tabs, activeTabId, onSelectTab, onOpenFavorite }: SafariSidebarProps) {
  return (
    <aside
      aria-label="Safari sidebar"
      className="flex w-[190px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-black/10 bg-sidebar/75 px-2 py-3"
    >
      <section aria-labelledby="safari-sidebar-favorites">
        <h2 id="safari-sidebar-favorites" className="px-2 pb-1 text-[11px] font-semibold text-black/40">
          Favorites
        </h2>
        <ul>
          {safariFavorites.map((fav) => (
            <li key={fav.id}>
              <button type="button" onClick={() => onOpenFavorite(fav)} className={row}>
                <FavoriteIcon icon={fav.icon} className="size-[18px] rounded-[5px]" />
                <span className="truncate">{fav.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="safari-sidebar-tabs">
        <h2 id="safari-sidebar-tabs" className="px-2 pb-1 text-[11px] font-semibold text-black/40">
          Open Tabs
        </h2>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                aria-current={tab.id === activeTabId ? "page" : undefined}
                onClick={() => onSelectTab(tab.id)}
                className={`${row} ${tab.id === activeTabId ? "bg-black/10" : ""}`}
              >
                <span className="truncate">{routeTitle(currentRoute(tab))}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
