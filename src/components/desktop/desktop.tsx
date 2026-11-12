import { ContextMenu } from "@/features/context-menu/components/context-menu";
import { ContextMenuToast } from "@/features/context-menu/components/context-menu-toast";
import { DesktopIcons } from "@/features/desktop-icons/components/desktop-icons";
import { DesktopWidgetLayer } from "@/features/widgets/components/desktop-widget-layer";
import { Dock } from "@/components/dock/dock";
import { MenuBar } from "@/components/menubar/menu-bar";
import { BrightnessOverlay } from "@/features/control-center/components/brightness-overlay";
import { NotificationStack } from "@/features/notifications/components/notification-stack";
import { WindowManager } from "@/components/windows/window-manager";
import { AppPreloader } from "./app-preloader";
import { LazyOverlay } from "./lazy-overlay";
import { OverlayShortcuts } from "./overlay-shortcuts";
import { DesktopBackground } from "./desktop-background";

/**
 * Root of the simulated desktop. It owns a single stacking context; each layer
 * (desktop icons, windows, menu bar, dock, overlays) is a sibling positioned
 * with the --z-* tokens defined in globals.css.
 */
export function Desktop() {
  return (
    <main className="relative isolate size-full overflow-hidden">
      <DesktopBackground />
      <DesktopIcons />
      <DesktopWidgetLayer />
      <AppPreloader />
      <OverlayShortcuts />
      <WindowManager />
      <LazyOverlay name="launchpad" />
      <LazyOverlay name="mission-control" />
      <MenuBar />
      <Dock />
      <NotificationStack />
      <LazyOverlay name="notification-center" />
      <LazyOverlay name="spotlight" />
      <LazyOverlay name="control-center" />
      <LazyOverlay name="view-options" />
      <LazyOverlay name="widget-gallery" />
      <ContextMenu />
      <ContextMenuToast />
      <BrightnessOverlay />
    </main>
  );
}
