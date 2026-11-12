"use client";

import { useEffect, useState } from "react";
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Search,
  Volume2,
  Wifi,
} from "lucide-react";
import type { BatteryManager, NavigatorWithBattery } from "@/types/battery";
import { useOverlayStore } from "@/store/overlay-store";
import { MenuClock } from "./menu-clock";

interface BatteryState {
  level: number;
  charging: boolean;
}

/** Real battery state when the browser exposes it; null otherwise. */
function useBattery() {
  const [state, setState] = useState<BatteryState | null>(null);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;

    let battery: BatteryManager | undefined;
    let cancelled = false;
    const update = () => {
      if (battery) setState({ level: battery.level, charging: battery.charging });
    };

    nav
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        battery = b;
        update();
        b.addEventListener("levelchange", update);
        b.addEventListener("chargingchange", update);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      battery?.removeEventListener("levelchange", update);
      battery?.removeEventListener("chargingchange", update);
    };
  }, []);

  return state;
}

function BatteryIndicator() {
  const battery = useBattery();
  const iconClass = "size-[18px]";

  if (!battery) {
    return <Battery className={iconClass} role="img" aria-label="Battery" />;
  }

  const percent = Math.round(battery.level * 100);
  const Icon = battery.charging
    ? BatteryCharging
    : battery.level > 0.75
      ? BatteryFull
      : battery.level > 0.4
        ? BatteryMedium
        : BatteryLow;
  return (
    <Icon
      className={iconClass}
      role="img"
      aria-label={`Battery ${percent}%${battery.charging ? ", charging" : ""}`}
    />
  );
}

/** Opens the same Spotlight overlay as the keyboard shortcut. */
function SpotlightButton() {
  const open = useOverlayStore((s) => s.active === "spotlight");
  const toggle = useOverlayStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-label="Spotlight Search"
      data-onboarding-target="onboarding-spotlight"
      aria-pressed={open}
      onClick={() => toggle("spotlight")}
      className="grid size-5 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-white/70 aria-pressed:bg-white/25"
    >
      <Search className="size-[15px]" strokeWidth={2} aria-hidden />
    </button>
  );
}

/** Two toggle pills, like the macOS Control Center icon. */
function ControlCenterIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="4.5" rx="2.25" />
      <circle cx="10.5" cy="4.75" r="1.1" fill="currentColor" stroke="none" />
      <rect x="1.5" y="9" width="13" height="4.5" rx="2.25" />
      <circle cx="5.5" cy="11.25" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ControlCenterButton() {
  const open = useOverlayStore((s) => s.active === "control-center");
  const toggle = useOverlayStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-label="Control Center"
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={() => toggle("control-center")}
      className="grid size-5 place-items-center rounded outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 aria-expanded:bg-white/25"
    >
      <ControlCenterIcon />
    </button>
  );
}

/** The date and time open Notification Center. */
function NotificationCenterButton() {
  const open = useOverlayStore((s) => s.active === "notification-center");
  const toggle = useOverlayStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-label="Notification Center"
      aria-expanded={open}
      onClick={() => toggle("notification-center")}
      className="rounded px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70 aria-expanded:bg-white/25"
    >
      <MenuClock />
    </button>
  );
}

/** Decorative representations only; they do not reflect or control the device. */
export function SystemStatus() {
  return (
    <div className="flex items-center gap-3 pr-1.5">
      <div className="hidden items-center gap-3 sm:flex">
        <Volume2 className="size-4" role="img" aria-label="Sound" />
        <Wifi className="size-4" role="img" aria-label="Wi-Fi" />
      </div>
      <BatteryIndicator />
      <SpotlightButton />
      <ControlCenterButton />
      <NotificationCenterButton />
    </div>
  );
}
