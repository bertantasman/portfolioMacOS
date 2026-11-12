import { FileQuestion } from "lucide-react";

export function ProjectEmptyState({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div role="alert" className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
      <FileQuestion className="size-12 text-black/30" strokeWidth={1.25} aria-hidden />
      <p className="text-[13px] font-medium text-black/70">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md bg-raised px-3 py-1 text-[13px] text-black/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.12)] outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        Close
      </button>
    </div>
  );
}
