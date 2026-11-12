"use client";

import { Bell, Layers, Moon, Search, Sun, Waves, X } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";
import { useMobileStore } from "../store/mobile-store";
import { OverlaySheet } from "./overlay-sheet";
import { useSwipe } from "./use-swipe";

const tile = "flex min-h-[72px] flex-col items-start justify-between rounded-2xl bg-white/12 p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/90 active:bg-white/20";

/**
 * Portfolio-only controls: the theme, reduced motion, and shortcuts to the other overlays. There are no switches for Wi-Fi,
 * Bluetooth, brightness or anything else on the device, because a web page cannot change them.
 */
export function ControlCenter() {
  const close = useMobileStore((s) => s.closeOverlay);
  const openOverlay = useMobileStore((s) => s.openOverlay);
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const swipe = useSwipe((d) => d === "up" && close());
  const dark = appearance === "dark";
  return (
    <OverlaySheet label="Control Center">
      <div {...swipe.handlers} className="touch-none p-4 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">Control Center</h2>
          <button type="button" data-autofocus onClick={close} aria-label="Close Control Center" className="grid size-11 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/90">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" role="switch" aria-checked={dark} onClick={() => setAppearance(dark ? "light" : "dark")} className={`${tile} ${dark ? "bg-white/25" : ""}`}>
            {dark ? <Moon className="size-6" aria-hidden /> : <Sun className="size-6" aria-hidden />}
            <span className="text-[14px] font-medium">Dark appearance <span className="block text-[12px] font-normal text-white/70">{dark ? "On" : "Off"}</span></span>
          </button>
          <button type="button" role="switch" aria-checked={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)} className={`${tile} ${reduceMotion ? "bg-white/25" : ""}`}>
            <Waves className="size-6" aria-hidden />
            <span className="text-[14px] font-medium">Reduce motion <span className="block text-[12px] font-normal text-white/70">{reduceMotion ? "On" : "Off"}</span></span>
          </button>
          <button type="button" onClick={() => openOverlay("spotlight")} className={tile}>
            <Search className="size-6" aria-hidden />
            <span className="text-[14px] font-medium">Search</span>
          </button>
          <button type="button" onClick={() => openOverlay("notifications")} className={tile}>
            <Bell className="size-6" aria-hidden />
            <span className="text-[14px] font-medium">Notifications</span>
          </button>
          <button type="button" onClick={() => openOverlay("switcher")} className={`${tile} col-span-2 min-h-[56px] flex-row items-center justify-start gap-3`}>
            <Layers className="size-6" aria-hidden />
            <span className="text-[14px] font-medium">App Switcher</span>
          </button>
        </div>
        <p className="mt-3 text-[12px] leading-4 text-white/65">These settings apply to this portfolio only. The signal, Wi-Fi and battery icons in the status bar are decorative.</p>
      </div>
    </OverlaySheet>
  );
}
