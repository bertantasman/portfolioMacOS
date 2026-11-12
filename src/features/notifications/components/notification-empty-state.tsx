import { BellOff } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div role="status" className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
      <BellOff className="mb-1 size-10 text-black/20" strokeWidth={1.25} aria-hidden />
      <p className="text-[15px] font-semibold text-black/55">No Notifications</p>
      <p className="text-[12px] text-black/40">You&apos;re all caught up.</p>
    </div>
  );
}
