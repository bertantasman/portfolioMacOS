import type { NotifyInput } from "@/features/notifications/types/notification";
import { useNotificationStore } from "@/store/notification-store";

/**
 * Posts a desktop notification from anywhere in application logic, without
 * importing any notification UI. Returns the notification id, or null when it
 * was not recorded (both banners and history are off, or it was a duplicate).
 *
 *   notify({ appId: "system-settings", title: "Settings Reset", message: "…" });
 */
export function notify(input: NotifyInput): string | null {
  return useNotificationStore.getState().addNotification(input);
}
