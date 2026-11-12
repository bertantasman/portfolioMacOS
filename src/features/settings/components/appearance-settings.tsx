"use client";

import { accentColors, appearanceModes, type AppearanceMode } from "@/config/appearance";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsGroup, SettingsRow } from "./settings-controls";

const labels: Record<AppearanceMode, string> = { light: "Light", dark: "Dark", auto: "Auto" };

/** Lightweight miniature of the desktop in each theme (no images). */
function Preview({ mode }: { mode: AppearanceMode }) {
  const scene = (dark: boolean) => (
    <div className={`absolute inset-0 ${dark ? "bg-[#3a3a45]" : "bg-[#c9d6f2]"}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 ${dark ? "bg-black/50" : "bg-white/60"}`} />
      <div className={`absolute top-3.5 left-3 h-7 w-12 rounded-[3px] ${dark ? "bg-[#2c2c2e]" : "bg-[#f6f6f6]"}`}>
        <div className="m-1 flex gap-0.5">
          <span className="size-[3px] rounded-full bg-[#ff5f57]" />
          <span className="size-[3px] rounded-full bg-[#febc2e]" />
          <span className="size-[3px] rounded-full bg-[#28c840]" />
        </div>
      </div>
      <div className={`absolute bottom-1 left-1/2 h-2 w-9 -translate-x-1/2 rounded-[3px] ${dark ? "bg-white/20" : "bg-white/60"}`} />
    </div>
  );
  return (
    <span aria-hidden className="relative block h-[58px] w-[92px] overflow-hidden rounded-md">
      {mode === "auto" ? (
        <>
          {scene(false)}
          <span className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">{scene(true)}</span>
        </>
      ) : (
        scene(mode === "dark")
      )}
    </span>
  );
}

export function AppearanceSettings() {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const accent = useSettingsStore((s) => s.accentColor);
  const setAccent = useSettingsStore((s) => s.setAccentColor);

  return (
    <>
      <SettingsGroup title="Appearance">
        <div className="px-3.5 py-3">
          <div role="radiogroup" aria-label="Appearance" className="flex flex-wrap gap-4">
            {appearanceModes.map((mode) => (
              <label key={mode} className="flex cursor-pointer flex-col items-center gap-1.5">
                <input
                  type="radio"
                  name="appearance"
                  value={mode}
                  checked={appearance === mode}
                  onChange={() => setAppearance(mode)}
                  className="peer sr-only"
                />
                <span className="rounded-lg p-[3px] ring-2 ring-transparent peer-checked:ring-(--accent) peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent">
                  <Preview mode={mode} />
                </span>
                <span className="text-[12px] text-black/80">{labels[mode]}</span>
              </label>
            ))}
          </div>
          <p className="mt-2.5 text-[12px] text-black/45">
            Auto follows your device&apos;s light or dark setting and updates when it changes.
          </p>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Accent colour">
        <SettingsRow label="Accent colour" description="Used for selected items, switches and focus highlights.">
          <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap justify-end gap-2">
            {accentColors.map((c) => (
              <label key={c.id} className="cursor-pointer" title={c.name}>
                <input
                  type="radio"
                  name="accent"
                  value={c.id}
                  checked={accent === c.id}
                  onChange={() => setAccent(c.id)}
                  aria-label={c.name}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  style={{ backgroundColor: c.value }}
                  className="block size-[18px] rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.25)] ring-2 ring-transparent ring-offset-2 ring-offset-transparent peer-checked:ring-black/60 peer-focus-visible:ring-(--accent)"
                />
              </label>
            ))}
          </div>
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}
