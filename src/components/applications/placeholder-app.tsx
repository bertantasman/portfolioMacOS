import Image from "next/image";
import type { ApplicationDefinition } from "@/types/application";

/** Stand-in content until each application is built. */
export function PlaceholderApp({ app }: { app: ApplicationDefinition }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Image src={app.icon} alt="" width={64} height={64} unoptimized draggable={false} className="size-16" />
      <p className="max-w-xs text-sm text-black/55">
        {app.name} application will be implemented in a future stage.
      </p>
    </div>
  );
}
