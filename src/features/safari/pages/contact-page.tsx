"use client";

import { Mail } from "lucide-react";
import { getProfileLink } from "@/features/social/utils/social-links";
import { openMailCompose } from "@/lib/navigation";
import { getContactChannels } from "@/lib/profile/selectors";

export function ContactPage() {
  const channels = getContactChannels();
  const social = (["github", "linkedin", "instagram"] as const).flatMap((p) => {
    const link = getProfileLink(p);
    return link ? [{ label: p[0].toUpperCase() + p.slice(1), url: link.url }] : [];
  });
  const linkClass = "rounded text-(--accent) outline-none hover:underline focus-visible:ring-2 focus-visible:ring-(--accent)";
  return (
    <div className="min-h-full bg-surface px-10 py-10">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[28px] font-semibold text-black/85">Contact</h1>
        <p className="mt-3 text-[14px] leading-6 text-black/60">
          Send a message from the Mail app. Your draft is saved on this device while you write, and a message only counts as sent once it
          has been accepted for delivery.
        </p>
        <button
          type="button"
          onClick={() => openMailCompose()}
          className="mt-6 flex h-9 items-center gap-2 rounded-lg bg-(--accent) px-4 text-[14px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2"
        >
          <Mail className="size-4" aria-hidden />
          Write a Message
        </button>
        {(channels.length > 0 || social.length > 0) && (
          <ul aria-label="Other ways to get in touch" className="mt-6 space-y-1.5 text-[14px]">
            {channels.map((c) => (
              <li key={c.label}>
                <span className="inline-block w-20 text-black/45">{c.label}</span>
                <a href={c.url} className={linkClass}>
                  {c.text}
                </a>
              </li>
            ))}
            {social.map((s) => (
              <li key={s.label}>
                <span className="inline-block w-20 text-black/45">{s.label}</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} profile (opens in a new tab)`} className={linkClass}>
                  {s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
