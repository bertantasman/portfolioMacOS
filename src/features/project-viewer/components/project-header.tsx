"use client";

import { useState } from "react";
import Image from "next/image";
import { ProjectIcon } from "@/components/file-icons";
import type { ProjectDetail } from "../utils/project-detail";
import { ProjectLinks } from "./project-links";

/** Cover (when there is one), title, tagline, a few verified badges, and the project's links. */
export function ProjectHeader({ detail }: { detail: ProjectDetail }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = detail.cover && !coverFailed ? detail.cover : undefined;

  return (
    <header className="space-y-4">
      {cover && (
        <div className="overflow-hidden rounded-xl bg-black/[0.05] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]">
          <Image
            src={cover.src}
            alt={cover.alt ?? `${detail.title} cover image`}
            width={cover.width}
            height={cover.height}
            quality={90}
            sizes="(max-width: 800px) 92vw, 720px"
            onError={() => setCoverFailed(true)}
            // Keeps the screenshot's own ratio (portrait or landscape) and never crops it.
            className="mx-auto h-auto max-h-[320px] w-auto max-w-full object-contain"
          />
        </div>
      )}
      <div className="flex items-start gap-4">
        {!cover && <ProjectIcon className="size-[64px] shrink-0" />}
        <div className="min-w-0">
          <h1 className="text-[24px] leading-7 font-semibold break-words text-black/90">{detail.title}</h1>
          {detail.tagline && <p className="mt-1 max-w-[62ch] text-[14px] leading-[20px] text-black/65">{detail.tagline}</p>}
          {!detail.tagline && detail.overview[0] && !cover && <p className="mt-1 max-w-[62ch] text-[13px] leading-[19px] text-black/60">{detail.overview[0]}</p>}
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Category, status and main technology">
            {detail.categoryNames.map((name) => (
              <li key={name} className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[11px] text-black/70">
                {name}
              </li>
            ))}
            {detail.status && (
              // The label is text, so status never depends on color alone.
              <li className="rounded-md bg-(--accent)/10 px-2 py-0.5 text-[11px] text-(--accent)">{detail.status.label}</li>
            )}
            {detail.primaryTechnology && <li className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[11px] text-black/70">{detail.primaryTechnology}</li>}
          </ul>
        </div>
      </div>
      <ProjectLinks links={detail.links} bare />
    </header>
  );
}
