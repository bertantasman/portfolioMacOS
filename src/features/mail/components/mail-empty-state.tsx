import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function MailEmptyState({ title, message, icon: Icon = Inbox }: { title: string; message: string; icon?: LucideIcon }) {
  return (
    <div role="status" className="flex size-full flex-col items-center justify-center gap-1 p-6 text-center">
      <Icon className="mb-1 size-10 text-black/20" strokeWidth={1.25} aria-hidden />
      <p className="text-[15px] font-semibold text-black/55">{title}</p>
      <p className="max-w-[280px] text-[12px] text-black/40">{message}</p>
    </div>
  );
}
