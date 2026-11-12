"use client";

import { useEffect, useRef, useState } from "react";
import type { WindowPayload } from "@/types/window";
import { isAboutSection } from "@/lib/profile/selectors";
import { isSafariRoute } from "../config/safari-routes";
import type { AboutAnchor } from "../pages/about-page";
import { useWindowChrome } from "@/components/windows/window-chrome";
import type { SafariFavorite } from "../config/safari-favorites";
import { useSafariNavigation } from "../hooks/use-safari-navigation";
import { openExternal } from "../lib/resolve-address";
import { SafariPageRenderer } from "./safari-page-renderer";
import { SafariSidebar } from "./safari-sidebar";
import { SafariTabBar, TAB_PANEL_ID, tabElementId } from "./safari-tab-bar";
import { SafariToolbar } from "./safari-toolbar";

/** One Safari window. All state is local to the window. */
export function SafariApp({ request }: { request?: Extract<WindowPayload, { type: "safari" }> }) {
  const nav = useSafariNavigation();
  const [handledRequest, setHandledRequest] = useState<number>();
  const [anchor, setAnchor] = useState<AboutAnchor>();
  // A deep link (Spotlight, Terminal, other apps) navigates this window once per request.
  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    if (isSafariRoute(request.route)) {
      nav.navigate(request.route);
      if (request.section && isAboutSection(request.section)) setAnchor({ section: request.section, nonce: request.requestId });
    }
  }
  const { isFocused } = useWindowChrome();
  const addressRef = useRef<HTMLInputElement>(null);
  const { state, activeTab, route } = nav;

  // Keyboard shortcuts are live only while this window is the focused one.
  useEffect(() => {
    if (!isFocused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      switch (e.key.toLowerCase()) {
        case "l":
          addressRef.current?.focus();
          break;
        case "t":
          nav.newTab();
          break;
        case "w":
          nav.closeTab(activeTab.id);
          break;
        case "r":
          nav.reload();
          break;
        default:
          return; // not ours: leave the browser's default alone
      }
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const openFavorite = (fav: SafariFavorite) => {
    if (!fav.target) return;
    if (fav.target.type === "internal") nav.navigate(fav.target.route);
    else openExternal(fav.target.url);
  };

  return (
    <div className="@container relative flex size-full flex-col text-black">
      <SafariToolbar
        route={route}
        loading={activeTab.loading}
        sidebarOpen={state.sidebarOpen}
        canGoBack={nav.canGoBack}
        canGoForward={nav.canGoForward}
        inputRef={addressRef}
        onToggleSidebar={nav.toggleSidebar}
        onBack={nav.goBack}
        onForward={nav.goForward}
        onHome={nav.home}
        onReload={nav.reload}
        onNewTab={() => nav.newTab()}
        onOpenInternal={nav.navigate}
        onOpenExternal={(url) => openExternal(url)}
      />
      {state.tabs.length > 1 && (
        <SafariTabBar
          tabs={state.tabs}
          activeTabId={state.activeTabId}
          onSelect={nav.selectTab}
          onClose={nav.closeTab}
          onNewTab={() => nav.newTab()}
        />
      )}
      <div className="flex min-h-0 flex-1">
        {state.sidebarOpen && (
          <SafariSidebar
            tabs={state.tabs}
            activeTabId={state.activeTabId}
            onSelectTab={nav.selectTab}
            onOpenFavorite={openFavorite}
          />
        )}
        <main
          id={TAB_PANEL_ID}
          role={state.tabs.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={state.tabs.length > 1 ? tabElementId(activeTab.id) : undefined}
          className="min-w-0 flex-1 overflow-auto bg-surface"
        >
          <SafariPageRenderer
            key={`${activeTab.id}:${activeTab.reloadCount}`}
            route={route}
            visits={state.visits}
            onOpenFavorite={openFavorite}
            onOpenRoute={nav.navigate}
            aboutAnchor={anchor}
          />
        </main>
      </div>
    </div>
  );
}
