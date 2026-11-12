import Image from "next/image";
import { FileTypeIcon, ProjectIcon } from "@/components/file-icons";
import type { SpotlightIcon as IconSpec } from "../types/spotlight";

export function SpotlightIcon({ icon }: { icon: IconSpec }) {
  const size = "size-[22px] shrink-0";
  switch (icon.kind) {
    case "image":
      return <Image src={icon.src} alt="" width={44} height={44} unoptimized draggable={false} className={size} />;
    case "project":
      return <ProjectIcon className={size} />;
    case "file":
      return (
        <span className={`${size} grid place-items-center`}>
          <FileTypeIcon file={icon.file} className="h-[20px] w-auto" />
        </span>
      );
  }
}
