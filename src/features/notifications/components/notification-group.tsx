import Image from "next/image";
import { getAppInfo } from "../hooks/use-notifications";
import type { DesktopNotification } from "../types/notification";
import { NotificationItem } from "./notification-item";

interface NotificationGroupProps {
  appId: string;
  notifications: readonly DesktopNotification[];
  now: number;
  onActivate: (n: DesktopNotification) => void;
  onRemove: (n: DesktopNotification) => void;
}

export function NotificationGroup({ appId, notifications, now, onActivate, onRemove }: NotificationGroupProps) {
  const app = getAppInfo(appId);
  const headingId = `notification-group-${appId}`;
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wide text-black/50 uppercase">
        <Image src={app.icon} alt="" width={36} height={36} unoptimized draggable={false} className="size-[14px]" />
        <span className="flex-1 truncate">{app.name}</span>
        {notifications.length > 1 && <span aria-label={`${notifications.length} notifications`}>{notifications.length}</span>}
      </h3>
      <ul className="space-y-1.5">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} now={now} onActivate={onActivate} onRemove={onRemove} />
        ))}
      </ul>
    </section>
  );
}
