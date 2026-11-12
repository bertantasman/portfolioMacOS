"use client";

import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { getProfileLink, type SocialPlatform } from "@/features/social/utils/social-links";
import { openApplicationById, openMailCompose } from "@/lib/navigation";
import { safeMailto } from "@/lib/safe-url";
import type { WidgetProps } from "../types/widgets";

const platforms: { id: SocialPlatform; label: string }[] = [
  { id: "github", label: "GitHub" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
];

/** Name and headline from the profile, and a button that opens a new message in Mail. */
export function ContactWidget({ size, preview }: WidgetProps) {
  const name = (profile.fullName ?? profile.displayName)?.trim() || "Portfolio";
  const headline = profile.headline?.trim();
  const tab = preview ? -1 : 0;
  const mailto = safeMailto(profile.email);
  // Only platforms with a valid configured link are offered.
  const socials = platforms.filter((p) => getProfileLink(p.id));
  const button = "inline-flex h-8 items-center gap-1.5 rounded-full bg-(--accent) px-3.5 text-[13px] font-medium text-(--accent-fg) outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  // The medium widget is only 160 px tall, so its buttons are a size smaller to keep them on one row.
  const compactButton = "inline-flex h-7 items-center gap-1.5 rounded-full bg-(--accent) px-2.5 text-[11px] font-medium text-(--accent-fg) outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  if (size === "small") {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
        <span className="line-clamp-1 text-[15px] font-semibold text-black/90">{name}</span>
        <button type="button" tabIndex={tab} onClick={() => openMailCompose()} aria-label={`Contact ${name}: write a message in Mail`} className={button}>
          <Mail className="size-3.5" aria-hidden />
          Contact
        </button>
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col justify-center gap-0.5 px-5 py-3">
      <span className="text-[11px] font-semibold tracking-wide text-(--accent) uppercase">Get in touch</span>
      <span className="text-[18px] leading-6 font-semibold text-black/90">{name}</span>
      {headline && <span className="text-[13px] leading-[18px] text-black/60">{headline}</span>}
      {mailto && profile.email && (
        <a href={mailto} tabIndex={tab} className="w-fit max-w-full truncate text-[12px] leading-4 text-black/55 outline-none hover:text-black/80 hover:underline focus-visible:ring-2 focus-visible:ring-(--accent)">
          {profile.email}
        </a>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button type="button" tabIndex={tab} onClick={() => openMailCompose()} aria-label={`Contact ${name}: write a message in Mail`} className={compactButton}>
          <Mail className="size-3.5" aria-hidden />
          Contact
        </button>
        {socials.map((s) => (
          <button key={s.id} type="button" tabIndex={tab} onClick={() => openApplicationById(s.id)} aria-label={`Open ${s.label}`} className="h-7 rounded-full bg-black/[0.07] px-2 text-[11px] text-black/75 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)">
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
