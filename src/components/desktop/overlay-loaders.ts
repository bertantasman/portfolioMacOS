import type { OverlayName } from "@/store/overlay-store";

/** Overlay code, fetched the first time the overlay opens (or when the desktop is idle). */
export const overlayLoaders = {
  spotlight: () => import("@/features/spotlight/components/spotlight").then((m) => ({ default: m.Spotlight })),
  launchpad: () => import("@/features/launchpad/components/launchpad").then((m) => ({ default: m.Launchpad })),
  "mission-control": () => import("@/features/mission-control/components/mission-control").then((m) => ({ default: m.MissionControl })),
  "control-center": () => import("@/features/control-center/components/control-center").then((m) => ({ default: m.ControlCenter })),
  "notification-center": () => import("@/features/notifications/components/notification-center").then((m) => ({ default: m.NotificationCenter })),
  "widget-gallery": () => import("@/features/widgets/components/widget-gallery").then((m) => ({ default: m.WidgetGallery })),
  "view-options": () => import("@/features/desktop-icons/components/view-options-panel").then((m) => ({ default: m.ViewOptionsPanel })),
} as const satisfies Partial<Record<OverlayName, () => Promise<{ default: React.ComponentType }>>>;

export const preloadOverlays = () => Object.values(overlayLoaders).forEach((load) => void load().catch(() => {}));
