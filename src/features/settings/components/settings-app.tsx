"use client";

import { useState, type ComponentType } from "react";
import { Accessibility, Bell, ChevronLeft, Dock, Info, Image as ImageIcon, SunMoon, Volume2, type LucideIcon } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import { notify } from "@/lib/notify";
import { useSettingsStore } from "@/store/settings-store";
import { AboutSettings } from "./about-settings";
import { AccessibilitySettings } from "./accessibility-settings";
import { AppearanceSettings } from "./appearance-settings";
import { DockSettings } from "./dock-settings";
import { SettingsGroup, SettingsRow } from "./settings-controls";
import { isSettingsPageId, type SettingsPageId } from "../lib/pages";
import { NotificationSettings } from "./notification-settings";
import { SoundSettings } from "./sound-settings";
import { WallpaperSettings } from "./wallpaper-settings";

interface Page {
  id: SettingsPageId;
  title: string;
  icon: LucideIcon;
  tile: string;
  Component: ComponentType;
  /** Offered at the bottom of the page. */
  resettable?: boolean;
}

const sections: { title: string; pages: Page[] }[] = [
  {
    title: "Main",
    pages: [
      { id: "appearance", title: "Appearance", icon: SunMoon, tile: "bg-[#3a8bff]", Component: AppearanceSettings, resettable: true },
      { id: "wallpaper", title: "Wallpaper", icon: ImageIcon, tile: "bg-[#36b7c9]", Component: WallpaperSettings },
      { id: "dock", title: "Desktop & Dock", icon: Dock, tile: "bg-[#6e6e73]", Component: DockSettings },
      { id: "accessibility", title: "Accessibility", icon: Accessibility, tile: "bg-[#2f7cf6]", Component: AccessibilitySettings },
      { id: "notifications", title: "Notifications", icon: Bell, tile: "bg-[#f0453d]", Component: NotificationSettings },
      { id: "sound", title: "Sound", icon: Volume2, tile: "bg-[#f0453d]", Component: SoundSettings },
    ],
  },
  {
    title: "About",
    pages: [{ id: "about", title: "About This Portfolio", icon: Info, tile: "bg-[#8e8e93]", Component: AboutSettings }],
  },
];

const allPages = sections.flatMap((s) => s.pages);

/** One System Settings window. Settings themselves live in the shared settings store. */
interface SettingsAppProps {
  /** Asks System Settings to show a section; a new `requestId` is a new request. */
  request?: { page: SettingsPageId; requestId: number };
}

export function SettingsApp({ request }: SettingsAppProps) {
  const [pageId, setPageId] = useState<string>(allPages[0].id);
  // Narrow windows show the list of sections or one section at a time, with a Back button.
  const [view, setView] = useState<"list" | "detail">("list");
  const [handledRequest, setHandledRequest] = useState<number | undefined>();
  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    if (isSettingsPageId(request.page)) {
      setPageId(request.page);
      setView("detail");
    }
  }
  const [confirmingReset, setConfirmingReset] = useState(false);
  const reset = useSettingsStore((s) => s.reset);
  const page = allPages.find((p) => p.id === pageId) ?? allPages[0];

  return (
    <div data-view={view} className="@container relative flex size-full bg-surface-2 text-black">
      <aside
        aria-label="Settings categories"
        className="flex w-[240px] shrink-0 flex-col border-r border-black/10 bg-sidebar/70 @max-[700px]:w-[190px] @max-[520px]:w-full @max-[520px]:border-r-0 @max-[520px]:in-data-[view=detail]:hidden"
      >
        {/* Room for the traffic lights floating over this corner. */}
        <WindowDragArea className="h-[52px] shrink-0" />
        <nav aria-label="Settings" className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title} className="mb-2">
              <ul>
                {section.pages.map((p) => {
                  const active = p.id === page.id;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          setPageId(p.id);
                          setView("detail");
                        }}
                        className={`flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] @max-[520px]:h-11 @max-[520px]:text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                          active ? "bg-(--accent) text-(--accent-fg)" : "text-black/85 hover:bg-black/5"
                        }`}
                      >
                        <span aria-hidden className={`grid size-[22px] shrink-0 place-items-center rounded-[6px] text-white ${p.tile}`}>
                          <p.icon className="size-[14px]" strokeWidth={2} />
                        </span>
                        <span className="truncate">{p.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col @max-[520px]:in-data-[view=list]:hidden">
        <WindowDragArea className="flex h-[52px] shrink-0 items-center gap-1 border-b border-black/10 bg-surface-2 px-5 @max-[520px]:pr-3 @max-[520px]:pl-[92px]">
          <button
            type="button"
            aria-label="Back to Settings"
            onClick={() => setView("list")}
            className="hidden size-9 shrink-0 place-items-center rounded-md text-black/65 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) @max-[520px]:grid"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <h1 className="truncate text-[15px] font-semibold text-black/85">{page.title}</h1>
        </WindowDragArea>
        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-[620px]">
            <page.Component />
            {page.resettable && (
              <SettingsGroup>
                <SettingsRow label="Reset all settings" description="Restores appearance, wallpaper, accent colour, Dock and motion settings. Your open windows are kept.">
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(true)}
                    className="h-6 rounded-md bg-raised px-3 text-[13px] text-black/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.12)] outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-(--accent)"
                  >
                    Reset to Defaults…
                  </button>
                </SettingsRow>
              </SettingsGroup>
            )}
          </div>
        </main>
      </div>

      {confirmingReset && (
        <ResetConfirm
          onCancel={() => setConfirmingReset(false)}
          onConfirm={() => {
            reset();
            setConfirmingReset(false);
            notify({
              appId: "system-settings",
              title: "Settings Reset",
              message: "Default settings have been restored.",
              dedupeKey: "settings-reset",
            });
          }}
        />
      )}
    </div>
  );
}

function ResetConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[rgb(0_0_0/0.25)] p-6"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        aria-describedby="reset-desc"
        className="w-[300px] rounded-xl bg-surface p-5 text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_16px_50px_rgba(0,0,0,0.35)]"
      >
        <h2 id="reset-title" className="text-[14px] font-semibold text-black/90">
          Reset to defaults?
        </h2>
        <p id="reset-desc" className="mt-1.5 text-[12px] text-black/55">
          Appearance, wallpaper, accent colour, Dock and motion settings return to their defaults. Nothing else changes.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="h-6 rounded-md bg-raised px-4 text-[13px] text-black/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-6 rounded-md bg-(--accent) px-4 text-[13px] text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
