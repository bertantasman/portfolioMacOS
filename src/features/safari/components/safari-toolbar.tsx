import type { RefObject } from "react";
import {
  ChevronLeft,
  ChevronRight,
  House,
  LayoutGrid,
  PanelLeft,
  Plus,
  RotateCw,
  Share,
} from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import { routeAddress, type SafariRoute } from "../config/safari-routes";
import { SafariAddressBar } from "./safari-address-bar";

interface SafariToolbarProps {
  route: SafariRoute;
  loading: boolean;
  sidebarOpen: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onToggleSidebar: () => void;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onReload: () => void;
  onNewTab: () => void;
  onOpenInternal: (route: SafariRoute) => void;
  onOpenExternal: (url: string) => void;
}

const button =
  "grid h-7 w-8 shrink-0 place-items-center rounded-md text-black/60 outline-none enabled:hover:bg-black/5 enabled:active:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:text-black/25";

export function SafariToolbar(props: SafariToolbarProps) {
  return (
    <WindowDragArea className="relative z-20 flex h-[52px] shrink-0 items-center gap-0.5 border-b border-black/10 bg-surface-2/90 pr-3 pl-[84px] @max-[520px]:pl-[92px]">
      <button
        type="button"
        aria-label="Show sidebar"
        aria-pressed={props.sidebarOpen}
        onClick={props.onToggleSidebar}
        className={`${button} @max-[520px]:hidden ${props.sidebarOpen ? "bg-black/[0.07] text-black/75" : ""}`}
      >
        <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Back" disabled={!props.canGoBack} onClick={props.onBack} className={`${button} ml-1 @max-[520px]:ml-0 @max-[520px]:h-9 @max-[520px]:w-9`}>
        <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
      </button>
      <button type="button" aria-label="Forward" disabled={!props.canGoForward} onClick={props.onForward} className={`${button} @max-[520px]:hidden`}>
        <ChevronRight className="size-[18px]" strokeWidth={2.25} aria-hidden />
      </button>
      <button type="button" aria-label="Home" onClick={props.onHome} className={`${button} @max-[760px]:hidden`}>
        <House className="size-[17px]" strokeWidth={1.75} aria-hidden />
      </button>

      <div className="mx-2 flex min-w-0 flex-1">
        <SafariAddressBar
          address={routeAddress(props.route)}
          loading={props.loading}
          inputRef={props.inputRef}
          onOpenInternal={props.onOpenInternal}
          onOpenExternal={props.onOpenExternal}
        />
      </div>

      <button type="button" aria-label="Reload page" onClick={props.onReload} className={`${button} @max-[520px]:h-9 @max-[520px]:w-9`}>
        <RotateCw className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      {/* Not implemented yet: shown disabled rather than pretending to work. */}
      <button type="button" aria-label="Share" disabled className={`${button} @max-[760px]:hidden`}>
        <Share className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="New tab" onClick={props.onNewTab} className={`${button} @max-[520px]:hidden`}>
        <Plus className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Show tab overview" disabled className={`${button} @max-[760px]:hidden`}>
        <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </WindowDragArea>
  );
}
