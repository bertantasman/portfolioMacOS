import { AtSign, FileText, Inbox, Send, type LucideIcon } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";

export type Mailbox = "inbox" | "drafts" | "sent" | "contact";

const boxes: { id: Mailbox; label: string; icon: LucideIcon }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "sent", label: "Sent", icon: Send },
  { id: "contact", label: "Contact", icon: AtSign },
];

interface MailSidebarProps {
  active: Mailbox;
  counts: Partial<Record<Mailbox, number>>;
  overlay: boolean;
  onSelect: (box: Mailbox) => void;
}

export function MailSidebar({ active, counts, overlay, onSelect }: MailSidebarProps) {
  return (
    <aside
      aria-label="Mailboxes"
      className={`flex w-[190px] shrink-0 flex-col border-r border-black/10 bg-sidebar/80 ${
        overlay ? "absolute inset-y-0 left-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.15)]" : ""
      }`}
    >
      {/* Room for the traffic lights floating over this corner. */}
      <WindowDragArea className="h-[52px] shrink-0" />
      <nav aria-label="Mailboxes" className="px-2 pb-3">
        <h2 className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40">Mailboxes</h2>
        <ul>
          {boxes.map(({ id, label, icon: Icon }) => {
            const selected = id === active;
            const count = counts[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  onClick={() => onSelect(id)}
                  className={`flex h-[28px] w-full items-center gap-2 rounded-md px-2 text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                    selected ? "bg-(--accent) text-(--accent-fg)" : "text-black/85 hover:bg-black/5"
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${selected ? "" : "text-(--accent)"}`} strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {count !== undefined && count > 0 && (
                    <span aria-label={`${count} messages`} className={`text-[12px] ${selected ? "opacity-80" : "text-black/40"}`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
