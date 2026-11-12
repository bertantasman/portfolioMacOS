"use client";

import { Accessibility, Image as ImageIcon, Moon, Monitor, Sun, type LucideIcon } from "lucide-react";
import { appearanceModes, type AppearanceMode } from "@/config/appearance";
import { openSystemSettings } from "@/lib/navigation";
import { useSettingsStore } from "@/store/settings-store";
import type { WidgetProps } from "../types/widgets";

const modes: Record<AppearanceMode, { label: string; Icon: LucideIcon }> = {
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  auto: { label: "Auto", Icon: Monitor },
};

function Toggle({ label, Icon, checked, onChange, tab }: { label: string; Icon: LucideIcon; checked: boolean; onChange: (v: boolean) => void; tab: number }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={tab}
      onClick={() => onChange(!checked)}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-black/[0.06] px-2.5 py-2 text-left outline-none hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-(--accent)"
    >
      <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full ${checked ? "bg-(--accent) text-(--accent-fg)" : "bg-black/[0.12] text-black/70"}`}>
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold text-black/85">{label}</span>
        <span className="text-[10px] text-black/50">{checked ? "On" : "Off"}</span>
      </span>
    </button>
  );
}

/** The same settings as Control Center and System Settings, read from and written to the shared store. */
export function QuickSettingsWidget({ size, preview }: WidgetProps) {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const dnd = useSettingsStore((s) => s.doNotDisturb);
  const setDnd = useSettingsStore((s) => s.setDoNotDisturb);
  const reduce = useSettingsStore((s) => s.reduceMotion);
  const setReduce = useSettingsStore((s) => s.setReduceMotion);
  const tab = preview ? -1 : 0;

  const segmented = (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-0.5 rounded-xl bg-black/[0.06] p-0.5">
      {appearanceModes.map((mode) => {
        const { label, Icon } = modes[mode];
        const selected = appearance === mode;
        return (
          <label key={mode} className={`flex h-7 cursor-pointer items-center justify-center gap-1 rounded-[10px] text-[11px] has-focus-visible:ring-2 has-focus-visible:ring-(--accent) ${selected ? "bg-raised text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]" : "text-black/60 hover:bg-black/[0.05]"}`}>
            <input type="radio" name={`qs-appearance-${preview ? "p" : "w"}`} value={mode} checked={selected} tabIndex={preview ? -1 : undefined} onChange={() => setAppearance(mode)} className="sr-only" />
            <Icon className="size-3" aria-hidden />
            {label}
          </label>
        );
      })}
    </div>
  );

  if (size === "small") {
    return (
      <div className="grid size-full grid-rows-2 gap-2 p-3">
        <Toggle label="Do Not Disturb" Icon={Moon} checked={dnd} onChange={setDnd} tab={tab} />
        <Toggle label="Reduce Motion" Icon={Accessibility} checked={reduce} onChange={setReduce} tab={tab} />
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col justify-center gap-2 p-4">
      {segmented}
      <div className="flex gap-2">
        <Toggle label="Do Not Disturb" Icon={Moon} checked={dnd} onChange={setDnd} tab={tab} />
        <Toggle label="Reduce Motion" Icon={Accessibility} checked={reduce} onChange={setReduce} tab={tab} />
      </div>
      {size === "large" && (
        <button type="button" tabIndex={tab} onClick={() => openSystemSettings("wallpaper")} className="mt-1 flex items-center gap-2 rounded-xl bg-black/[0.06] px-3 py-2 text-left text-[12px] text-black/85 outline-none hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-(--accent)">
          <ImageIcon className="size-4 text-black/60" aria-hidden />
          Wallpaper…
        </button>
      )}
    </div>
  );
}
