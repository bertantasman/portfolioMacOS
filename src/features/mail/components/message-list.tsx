import type { LocalMessage } from "@/store/mail-store";
import { formatListDate, preview } from "../lib/format";

interface MessageListProps {
  label: string;
  messages: readonly LocalMessage[];
  selectedId: string | undefined;
  /** "To" line for sent mail; "From" line for drafts. */
  kind: "drafts" | "sent";
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function MessageList({ label, messages, selectedId, kind, onSelect, onOpen }: MessageListProps) {
  return (
    <ul aria-label={label} className="p-2">
      {messages.map((m) => {
        const selected = m.id === selectedId;
        return (
          <li key={m.id}>
            <button
              type="button"
              aria-current={selected ? "true" : undefined}
              onClick={() => onSelect(m.id)}
              onDoubleClick={() => kind === "drafts" && onOpen(m.id)}
              className={`block w-full rounded-lg px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                selected ? "bg-(--accent) text-(--accent-fg)" : "hover:bg-black/[0.04]"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-semibold">{m.subject.trim() || "(No Subject)"}</span>
                <span className={`shrink-0 text-[11px] ${selected ? "opacity-80" : "text-black/45"}`}>{formatListDate(m.at)}</span>
              </span>
              <span className={`block truncate text-[12px] ${selected ? "opacity-85" : "text-black/60"}`}>
                {kind === "sent" ? "To: Portfolio owner" : m.fromName.trim() || m.fromEmail.trim() || "No sender yet"}
              </span>
              <span className={`block truncate text-[12px] ${selected ? "opacity-75" : "text-black/40"}`}>{preview(m.body) || "No content"}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
