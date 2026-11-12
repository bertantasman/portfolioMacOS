"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";
import { useLockClock } from "@/features/startup/hooks/use-lock-clock";
import { useMobileStore } from "../store/mobile-store";
import { useSwipe } from "./use-swipe";

/**
 * The top strip of the home screen. The time opens Notification Center and the icons open Control Center (a tap, or a
 * swipe down on that side). The signal, Wi-Fi and battery symbols are decorative: they show nothing about the device.
 */
export function StatusBar() {
  const { time } = useLockClock();
  const openOverlay = useMobileStore((s) => s.openOverlay);
  const left = useSwipe((d) => d === "down" && openOverlay("notifications"));
  const right = useSwipe((d) => d === "down" && openOverlay("control"));
  const base = "flex h-11 touch-none items-center rounded-full px-4 text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white/90";
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between pt-[env(safe-area-inset-top)]">
      <button type="button" {...left.handlers} onClick={() => !left.consumeClick() && openOverlay("notifications")} aria-label="Notification Center" className={`${base} tabular-nums`}>
        {time || " "}
      </button>
      <button type="button" {...right.handlers} onClick={() => !right.consumeClick() && openOverlay("control")} aria-label="Control Center" className={`${base} gap-1.5`}>
        <Signal className="size-4" aria-hidden />
        <Wifi className="size-4" aria-hidden />
        <BatteryFull className="size-5" aria-hidden />
      </button>
    </div>
  );
}
