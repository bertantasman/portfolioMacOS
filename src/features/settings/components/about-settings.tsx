"use client";

import { siteConfig } from "@/config/site";
import { profile } from "@/data/profile";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SettingsGroup, SettingsRow } from "./settings-controls";

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Motion", "Zustand", "Lucide"];

export function AboutSettings() {
  const startTour = useOnboardingStore((s) => s.start);
  const rows = [
    { label: "Name", value: siteConfig.title },
    ...(siteConfig.version ? [{ label: "Version", value: siteConfig.version }] : []),
    { label: "Developer", value: profile.displayName },
    { label: "Built with", value: STACK.join(", ") },
  ];
  return (
    <>
      <SettingsGroup title="About This Portfolio">
        <p className="px-3.5 py-3 text-[13px] text-black/75">{siteConfig.description}</p>
        <dl className="divide-y divide-black/[0.08]">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4 px-3.5 py-2 text-[13px]">
              <dt className="text-black/50">{r.label}</dt>
              <dd className="text-right text-black/85">{r.value}</dd>
            </div>
          ))}
        </dl>
      </SettingsGroup>
      <SettingsGroup title="Help & Onboarding">
        <SettingsRow label="Tutorial" description="Take the short tour of the desktop again. Your windows and settings stay as they are.">
          <button
            type="button"
            onClick={startTour}
            className="h-6 rounded-md bg-raised px-3 text-[13px] text-black/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.12)] outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            Restart Tutorial
          </button>
        </SettingsRow>
      </SettingsGroup>
      <p className="px-1 text-[11px] text-black/40">
        An independent portfolio project inspired by macOS. It is not affiliated with or endorsed by Apple.
      </p>
    </>
  );
}
