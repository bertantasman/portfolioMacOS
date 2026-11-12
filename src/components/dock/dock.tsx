"use client";

import { Fragment, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getDockSections } from "@/config/applications";
import { dockIconSize } from "@/config/appearance";
import { useOverlayStore } from "@/store/overlay-store";
import { useSettingsStore } from "@/store/settings-store";
import { useDockMagnification } from "@/hooks/use-dock-magnification";
import { useWindowStore } from "@/store/window-store";
import type { ApplicationDefinition, ApplicationId } from "@/types/application";
import { DockItem } from "./dock-item";
import { DockSeparator } from "./dock-separator";

interface DockProps {
  /** Overrides the running set, which otherwise comes from open windows. */
  running?: ReadonlySet<ApplicationId>;
  /** Overrides launching, which otherwise opens or focuses the app's window. */
  onLaunch?: (app: ApplicationDefinition) => void;
}

export function Dock({ running: runningOverride, onLaunch }: DockProps) {
  // An application is running while it has at least one window, minimized or not.
  const openAppIds = useWindowStore(useShallow((s) => s.windows.map((w) => w.appId)));
  const launchApplication = useWindowStore((s) => s.launchApplication);
  const running = useMemo(
    () => runningOverride ?? new Set<ApplicationId>(openAppIds),
    [runningOverride, openAppIds],
  );
  const launch =
    onLaunch ??
    ((app: ApplicationDefinition) => {
      const overlays = useOverlayStore.getState();
      // Overlays toggle (a second click closes them); launching an app dismisses Launchpad.
      if (app.overlay) return overlays.toggle(app.overlay);
      overlays.close("launchpad");
      overlays.close("mission-control");
      launchApplication(app.id);
    });

  const { field, handlers } = useDockMagnification();
  const dockSize = useSettingsStore((s) => s.dockSize);
  const sections = getDockSections();
  const lastSection = sections.length - 1;
  // Below 520px only the primary section is shown. Its icons are sized so they always fit the screen:
  // (viewport − outer and inner padding − 6px slot padding per icon) ÷ icon count.
  const narrowCount = sections[0]?.length ?? 1;
  const narrowIcon = `calc((100vw - ${26 + 6 * narrowCount}px) / ${narrowCount})`;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-(--z-dock) flex justify-center px-2">
      <nav
        aria-label="Dock"
        data-onboarding-target="onboarding-dock"
        {...handlers}
        style={{ "--dock-size": `${dockIconSize(dockSize)}px`, "--dock-narrow": narrowIcon } as React.CSSProperties}
        className="pointer-events-auto relative rounded-[22px] [--dock-icon:min(44px,var(--dock-size),var(--dock-narrow))] min-[520px]:[--dock-icon:min(var(--dock-size),max(40px,calc((100vw-120px)/10)))]"
      >
        {/* Blur lives on its own layer so tooltips can blur the wallpaper too. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[22px] border border-white/25 bg-(--dock-bg) shadow-[0_8px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_0_0.5px_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150"
        />
        <ul className="relative flex items-end px-[5px] pt-1.5 pb-2.5">
          {sections.map((apps, sectionIndex) => (
            <Fragment key={apps[0].dockSection}>
              {sectionIndex > 0 && (
                <DockSeparator
                  className={sections[sectionIndex][0].dockSection !== "primary" ? "max-[519px]:hidden" : ""}
                />
              )}
              {apps.map((app, i) => {
                const isFirst = sectionIndex === 0 && i === 0;
                const isLast = sectionIndex === lastSection && i === apps.length - 1;
                return (
                  <DockItem
                    key={app.id}
                    app={app}
                    running={running.has(app.id)}
                    magnification={field}
                    tooltipAlign={isFirst ? "start" : isLast ? "end" : "center"}
                    hideOnNarrow={app.dockSection !== "primary"}
                    onLaunch={launch}
                  />
                );
              })}
            </Fragment>
          ))}
        </ul>
      </nav>
    </div>
  );
}
