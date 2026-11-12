import { Images } from "lucide-react";

export function PhotosEmptyState({ title = "No Photos", message }: { title?: string; message: string }) {
  return (
    <div role="status" className="flex size-full flex-col items-center justify-center gap-1.5 p-6 text-center">
      <Images className="mb-1 size-12 text-black/20" strokeWidth={1.25} aria-hidden />
      <p className="text-[15px] font-semibold text-black/60">{title}</p>
      <p className="max-w-[260px] text-[12px] text-black/40">{message}</p>
    </div>
  );
}
