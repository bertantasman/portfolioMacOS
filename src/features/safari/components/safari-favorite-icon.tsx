import Image from "next/image";
import { Folder, Mail, User } from "lucide-react";
import type { SafariFavorite } from "../config/safari-favorites";

const tiles = {
  about: { Icon: User, className: "bg-[#0a84ff]" },
  projects: { Icon: Folder, className: "bg-[#6e5bf0]" },
  contact: { Icon: Mail, className: "bg-[#30b94d]" },
} as const;

/** Rounded favorite tile: coloured glyph for internal pages, brand icon for external ones. */
export function FavoriteIcon({
  icon,
  className = "size-16",
}: {
  icon: SafariFavorite["icon"];
  className?: string;
}) {
  if (icon === "github" || icon === "linkedin") {
    return (
      <Image
        src={`/icons/apps/${icon}.svg`}
        alt=""
        width={64}
        height={64}
        unoptimized
        draggable={false}
        className={`${className} rounded-[16px]`}
      />
    );
  }
  const { Icon, className: tone } = tiles[icon];
  return (
    <span
      aria-hidden
      className={`${className} grid place-items-center rounded-[16px] text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] ${tone}`}
    >
      <Icon className="size-1/2" strokeWidth={1.75} />
    </span>
  );
}
