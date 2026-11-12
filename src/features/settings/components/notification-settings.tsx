"use client";

import { useSettingsStore } from "@/store/settings-store";
import { SettingsGroup, SettingsRow, SettingsToggle } from "./settings-controls";

export function NotificationSettings() {
  const doNotDisturb = useSettingsStore((s) => s.doNotDisturb);
  const setDoNotDisturb = useSettingsStore((s) => s.setDoNotDisturb);
  const banners = useSettingsStore((s) => s.notificationBanners);
  const setBanners = useSettingsStore((s) => s.setNotificationBanners);
  const history = useSettingsStore((s) => s.notificationHistory);
  const setHistory = useSettingsStore((s) => s.setNotificationHistory);

  return (
    <SettingsGroup title="Notifications">
      <SettingsRow
        label="Do Not Disturb"
        htmlFor="notif-dnd"
        description="Hides banners. Notifications are still saved to Notification Center."
      >
        <SettingsToggle id="notif-dnd" label="Do Not Disturb" checked={doNotDisturb} onChange={setDoNotDisturb} />
      </SettingsRow>
      <SettingsRow label="Show notification banners" htmlFor="notif-banners" description="Banners appear briefly in the upper right corner.">
        <SettingsToggle id="notif-banners" label="Show notification banners" checked={banners} onChange={setBanners} />
      </SettingsRow>
      <SettingsRow
        label="Keep notification history"
        htmlFor="notif-history"
        description="Saves notifications in Notification Center for this session. When off, new notifications are shown as banners only."
      >
        <SettingsToggle id="notif-history" label="Keep notification history" checked={history} onChange={setHistory} />
      </SettingsRow>
    </SettingsGroup>
  );
}
