"use client";

import { useState } from "react";
import { Check, Copy, Globe, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { copyText } from "@/lib/clipboard";
import { getContactChannels } from "@/lib/profile/selectors";
import { safeMailto } from "@/lib/safe-url";
import { AppScreen } from "../components/app-screen";
import { getExternalApps } from "../lib/apps";

const readable = (url: string) => {
  const text = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

/** Real contact details only: the profile's email and website, and the verified social profiles. No form that pretends to send. */
export default function ContactApp() {
  const [copied, setCopied] = useState(false);
  const channels = getContactChannels();
  const mail = safeMailto(profile.email);
  const socials = getExternalApps();
  const name = (profile.fullName ?? profile.displayName)?.trim();
  const row = "flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-black/10 bg-surface-2 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent) active:bg-black/[0.05]";
  return (
    <AppScreen title="Contact">
      <h2 className="text-[22px] font-bold text-black/90">{name}</h2>
      {profile.headline && <p className="text-[14px] text-black/60">{profile.headline}</p>}
      {channels.length === 0 && socials.length === 0 && <p role="status" className="mt-8 text-center text-[14px] text-black/60">No contact details are published yet.</p>}
      <ul className="mt-5 space-y-2.5">
        {mail && profile.email && (
          <li className="flex gap-2">
            <a href={mail} className={row}>
              <Mail className="size-5 shrink-0 text-(--accent)" aria-hidden />
              <span className="min-w-0"><span className="block text-[12px] text-black/50">Email</span><span className="block truncate text-[15px] text-black/90">{profile.email}</span></span>
            </a>
            <button
              type="button"
              onClick={async () => {
                setCopied(await copyText(profile.email!));
                setTimeout(() => setCopied(false), 1800);
              }}
              aria-label={copied ? "Email address copied" : "Copy email address"}
              className="grid w-14 shrink-0 place-items-center rounded-2xl border border-black/10 bg-surface-2 text-black/70 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              {copied ? <Check className="size-5 text-green-600" aria-hidden /> : <Copy className="size-5" aria-hidden />}
            </button>
          </li>
        )}
        {channels.filter((c) => c.label === "Website").map((c) => (
          <li key={c.url}>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className={row}>
              <Globe className="size-5 shrink-0 text-(--accent)" aria-hidden />
              <span className="min-w-0"><span className="block text-[12px] text-black/50">Website (opens in a new tab)</span><span className="block truncate text-[15px] text-black/90">{c.text}</span></span>
            </a>
          </li>
        ))}
        {socials.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.icon} alt="" width={28} height={28} className="size-7 rounded-md" />
              <span className="min-w-0"><span className="block text-[12px] text-black/50">{s.name} (opens in a new tab)</span><span className="block truncate text-[15px] text-black/90">{readable(s.url)}</span></span>
            </a>
          </li>
        ))}
      </ul>
    </AppScreen>
  );
}
