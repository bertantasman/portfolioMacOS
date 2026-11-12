import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function SocialEmptyState({
  title,
  message,
  icon: Icon = Inbox,
}: {
  title: string;
  message: string;
  icon?: LucideIcon;
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-1 px-6 py-10 text-center">
      <Icon className="mb-1 size-9 text-black/20" strokeWidth={1.25} aria-hidden />
      <p className="text-[14px] font-semibold text-black/55">{title}</p>
      <p className="max-w-[300px] text-[12px] text-black/40">{message}</p>
    </div>
  );
}
