"use client";

import { useLaunchpadStore } from "@/store/launchpad-store";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsGroup, SettingsRow, SettingsSlider, SettingsToggle } from "./settings-controls";

export function DockSettings() {
  const size = useSettingsStore((s) => s.dockSize);
  const setSize = useSettingsStore((s) => s.setDockSize);
  const magnification = useSettingsStore((s) => s.dockMagnification);
  const setMagnification = useSettingsStore((s) => s.setDockMagnification);
  const strength = useSettingsStore((s) => s.dockMagnificationStrength);
  const setStrength = useSettingsStore((s) => s.setDockMagnificationStrength);

  const customOrder = useLaunchpadStore((s) => s.applicationOrder.length > 0);
  const resetLayout = useLaunchpadStore((s) => s.resetApplicationOrder);

  return (
    <>
    <SettingsGroup title="Dock">
      <SettingsRow label="Size" htmlFor="dock-size">
        <SettingsSlider id="dock-size" label="Dock size" value={size} onChange={setSize} startLabel="Small" endLabel="Large" />
      </SettingsRow>
      <SettingsRow label="Magnification" htmlFor="dock-magnification" description="Icons grow as the pointer moves over them.">
        <SettingsToggle id="dock-magnification" label="Magnification" checked={magnification} onChange={setMagnification} />
      </SettingsRow>
      <SettingsRow label="Magnification strength" htmlFor="dock-strength">
        <SettingsSlider
          id="dock-strength"
          label="Magnification strength"
          value={strength}
          onChange={setStrength}
          startLabel="Min"
          endLabel="Max"
          disabled={!magnification}
        />
      </SettingsRow>
    </SettingsGroup>
    <SettingsGroup title="Launchpad">
      <SettingsRow label="Application layout" description="Put the apps back in their default order. Open windows and other settings are not affected.">
        <button
          type="button"
          onClick={resetLayout}
          disabled={!customOrder}
          className="h-6 rounded-md bg-raised px-3 text-[13px] text-black/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.12)] outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-40"
        >
          Reset Layout
        </button>
      </SettingsRow>
    </SettingsGroup>
    </>
  );
}
