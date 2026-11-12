import { Loader2 } from "lucide-react";

/** Shown while the PDF loads. No percentages: the real progress isn't known. */
export function PreviewEmptyState({ title }: { title: string }) {
  return (
    <div role="status" className="flex size-full flex-col items-center justify-center gap-2 text-center">
      <Loader2 className="size-6 animate-spin text-black/35 motion-reduce:animate-none" aria-hidden />
      <p className="text-[13px] text-black/55">Opening {title}…</p>
    </div>
  );
}
