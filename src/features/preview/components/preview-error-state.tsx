import { FileWarning } from "lucide-react";

export function PreviewErrorState({
  title = "Unable to Open Document",
  message = "The PDF could not be loaded.",
  detail,
}: {
  title?: string;
  message?: string;
  detail?: string;
}) {
  return (
    <div role="alert" className="flex size-full flex-col items-center justify-center gap-1 p-6 text-center">
      <FileWarning className="mb-2 size-12 text-black/25" strokeWidth={1.25} aria-hidden />
      <p className="text-[15px] font-semibold text-black/70">{title}</p>
      <p className="text-[13px] text-black/55">{message}</p>
      {detail && <p className="mt-1 text-[12px] text-black/40">{detail}</p>}
    </div>
  );
}
