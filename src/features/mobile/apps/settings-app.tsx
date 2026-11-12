"use client";

import { useState } from "react";
import { accentColors, appearanceModes } from "@/config/appearance";
import { useSettingsStore } from "@/store/settings-store";
import { AppScreen } from "../components/app-screen";
import { useNoticeStore } from "../store/notice-store";

const labels = { light: "Light", dark: "Dark", auto: "Auto" } as const;

/** Preferences for this portfolio only. Nothing here reaches the device: a web page cannot change Wi-Fi, brightness or privacy settings. */
export default function SettingsApp() {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const accent = useSettingsStore((s) => s.accentColor);
  const setAccent = useSettingsStore((s) => s.setAccentColor);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const reset = useSettingsStore((s) => s.reset);
  const [confirming, setConfirming] = useState(false);
  return (
    <AppScreen title="Settings">
      <section aria-labelledby="appearance" className="mb-6">
        <h2 id="appearance" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Appearance</h2>
        <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-xl bg-black/[0.07] p-1">
          {appearanceModes.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={appearance === m} onClick={() => setAppearance(m)} className={`h-10 rounded-lg text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${appearance === m ? "bg-surface text-black shadow-sm" : "text-black/65"}`}>
              {labels[m]}
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="accent" className="mb-6">
        <h2 id="accent" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Accent colour</h2>
        <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-3">
          {accentColors.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={accent === c.id} aria-label={c.name} onClick={() => setAccent(c.id)} className="grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-black/60">
              <span className={`size-8 rounded-full ${accent === c.id ? "ring-2 ring-offset-2 ring-black/70 ring-offset-surface" : ""}`} style={{ backgroundColor: c.value }} />
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="motion" className="mb-6">
        <h2 id="motion" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Motion</h2>
        <button type="button" role="switch" aria-checked={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)} className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-black/10 bg-surface-2 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">
          <span className="text-[16px] text-black/90">Reduce motion</span>
          <span aria-hidden className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${reduceMotion ? "bg-(--accent)" : "bg-black/20"}`}>
            <span className={`size-6 rounded-full bg-white shadow transition-transform ${reduceMotion ? "translate-x-5" : ""}`} />
          </span>
        </button>
      </section>
      <section aria-labelledby="reset">
        <h2 id="reset" className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">Reset</h2>
        {confirming ? (
          <div role="alertdialog" aria-label="Confirm reset" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-[14px] text-black/85">Reset the appearance, accent colour and motion preferences to their defaults, and show dismissed notifications again?</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { reset(); useNoticeStore.setState({ dismissed: [] }); setConfirming(false); }} className="h-11 flex-1 rounded-full bg-red-600 text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Reset</button>
              <button type="button" autoFocus onClick={() => setConfirming(false)} className="h-11 flex-1 rounded-full bg-black/[0.07] text-[15px] text-black/85 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="h-12 w-full rounded-2xl border border-black/10 bg-surface-2 text-[16px] text-red-600 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">Reset portfolio preferences…</button>
        )}
        <p className="mt-3 text-[12px] leading-4 text-black/50">These preferences are saved in this browser and also apply to the desktop version of this portfolio.</p>
      </section>
    </AppScreen>
  );
}
