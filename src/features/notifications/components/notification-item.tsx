import { X } from "lucide-react";
import type { DesktopNotification } from "../types/notification";
import { formatRelativeTime } from "../utils/format-time";

interface NotificationItemProps {
  notification: DesktopNotification;
  now: number;
  onActivate: (n: DesktopNotification) => void;
  onRemove: (n: DesktopNotification) => void;
}

export function NotificationItem({ notification: n, now, onActivate, onRemove }: NotificationItemProps) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onActivate(n)}
        aria-label={`${n.read ? "" : "Unread: "}${n.title}${n.message ? `. ${n.message}` : ""}${n.action ? ". Opens related content" : ""}`}
        className="flex w-full items-start gap-2 rounded-[14px] bg-black/[0.05] px-3 py-2.5 pr-9 text-left outline-none hover:bg-black/[0.08] focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <span
          aria-hidden
          className={`mt-[5px] size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-(--accent)"}`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={`truncate text-[13px] text-black/90 ${n.read ? "font-medium" : "font-semibold"}`}>{n.title}</span>
            <span className="shrink-0 text-[11px] text-black/45">{formatRelativeTime(n.createdAt, now)}</span>
          </span>
          {n.message && <span className="mt-0.5 line-clamp-3 block text-[12px] text-black/65">{n.message}</span>}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Remove notification: ${n.title}`}
        onClick={() => onRemove(n)}
        className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-black/10 text-black/55 opacity-0 outline-none group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-black/20 focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <X className="size-3" aria-hidden />
      </button>
    </li>
  );
}
