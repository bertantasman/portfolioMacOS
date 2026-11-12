import { PanelLeft, SquarePen } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";

interface MailToolbarProps {
  title: string;
  subtitle?: string;
  sidebarVisible: boolean;
  clearTrafficLights: boolean;
  onToggleSidebar: () => void;
  onCompose: () => void;
}

export function MailToolbar({ title, subtitle, sidebarVisible, clearTrafficLights, onToggleSidebar, onCompose }: MailToolbarProps) {
  return (
    <WindowDragArea
      className={`flex h-[52px] shrink-0 items-center gap-1 border-b border-black/10 bg-surface-2 pr-3 ${clearTrafficLights ? "pl-[84px]" : "pl-3"}`}
    >
      <button
        type="button"
        aria-label="Show mailboxes"
        aria-pressed={sidebarVisible}
        onClick={onToggleSidebar}
        className={`grid h-7 w-8 place-items-center rounded-md text-black/60 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent) ${sidebarVisible ? "bg-black/[0.07]" : ""}`}
      >
        <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>
      <div className="mr-auto ml-2 min-w-0">
        <h1 className="truncate text-[13px] leading-4 font-semibold text-black/85">{title}</h1>
        {subtitle && <p className="truncate text-[11px] leading-3 text-black/40">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onCompose}
        className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-black/75 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
        <span className="@max-[700px]:sr-only">New Message</span>
      </button>
    </WindowDragArea>
  );
}
