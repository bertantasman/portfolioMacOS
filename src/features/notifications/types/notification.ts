export type NotificationPriority = "low" | "normal" | "high";

/** What clicking a notification does. Targets are validated when the action runs. */
export type NotificationAction =
  | { type: "open-application"; appId: string }
  | { type: "open-project"; projectId: string }
  | { type: "open-folder"; folderId: string }
  | { type: "open-note"; noteId: string }
  | { type: "open-media"; mediaId: string };

export interface DesktopNotification {
  /** Stable, unique for the session. */
  id: string;
  /** Application id from the registry; unknown ids render with a fallback icon. */
  appId: string;
  title: string;
  message?: string;
  /** Real creation time (ms since epoch). */
  createdAt: number;
  priority: NotificationPriority;
  read: boolean;
  action?: NotificationAction;
  /** Shown as a banner only; removed when dismissed because history is turned off. */
  transient?: boolean;
}

export interface NotifyInput {
  appId: string;
  title: string;
  message?: string;
  priority?: NotificationPriority;
  action?: NotificationAction;
  /** Repeats with the same key within a couple of seconds are ignored. */
  dedupeKey?: string;
}
