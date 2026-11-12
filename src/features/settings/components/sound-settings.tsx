"use client";

import { SettingsGroup, SettingsRow, SettingsToggle } from "./settings-controls";

export function SoundSettings() {
  return (
    <SettingsGroup title="Sound effects">
      <SettingsRow
        label="Interface sound effects"
        htmlFor="sound-effects"
        description="Not available yet: this portfolio doesn't have any interface sounds, so there is nothing to turn on."
      >
        <SettingsToggle id="sound-effects" label="Interface sound effects (not available)" checked={false} onChange={() => {}} disabled />
      </SettingsRow>
    </SettingsGroup>
  );
}
