"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Accessibility, ChevronRight, Image as ImageIcon, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { appearanceModes, type AppearanceMode } from "@/config/appearance";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { openSystemSettings } from "@/lib/navigation";
import { useOverlayStore } from "@/store/overlay-store";
import { useSettingsStore } from "@/store/settings-store";

const modeMeta: Record<AppearanceMode, { label: string; Icon: LucideIcon }> = {
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  auto: { label: "Auto", Icon: Monitor },
};

const BRIGHTNESS_MIN = 50;

/** Control Center: a desktop overlay (not a window), opened from the menu bar. */
export function ControlCenter() {
  const open = useOverlayStore((s) => s.active === "control-center");
  const reduced = useShouldReduceMotion();
  return <AnimatePresence>{open && <Panel key="cc" reduced={reduced} />}</AnimatePresence>;
}

function Panel({ reduced }: { reduced: boolean }) {
  const close = useOverlayStore((s) => s.close);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const duration = reduced ? 0 : 0.18;

  const dismiss = (restoreFocus = true) => {
    close("control-center");
    const el = previousFocus.current;
    if (restoreFocus && el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  // One Escape listener for the lifetime of the panel.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-(--z-notification-center)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      // A press outside the panel closes it, and nothing behind receives that press.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss(false);
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="Control Center"
        tabIndex={-1}
        initial={reduced ? false : { y: -8, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={reduced ? undefined : { y: -6, scale: 0.99, opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
        style={{ transformOrigin: "top right" }}
        className="absolute top-[calc(1.75rem+env(safe-area-inset-top)+6px)] right-2 flex max-h-[calc(100dvh-5rem)] w-[360px] max-w-[calc(100vw-16px)] flex-col gap-2 overflow-y-auto rounded-[20px] border border-black/10 bg-window p-3 text-black shadow-[0_16px_60px_rgba(0,0,0,0.35)] outline-none backdrop-blur-3xl backdrop-saturate-150"
      >
        <h2 className="sr-only">Control Center</h2>
        <AppearanceControl />
        <div className="grid grid-cols-2 gap-2">
          <DoNotDisturbTile />
          <ReduceMotionTile />
        </div>
        <BrightnessControl />
        <WallpaperButton onOpen={() => dismiss(false)} />
      </motion.div>
    </motion.div>
  );
}

const group = "rounded-[14px] bg-black/[0.06] px-3 py-2.5";

function AppearanceControl() {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  return (
    <section className={group} aria-labelledby="cc-appearance">
      <h3 id="cc-appearance" className="mb-2 text-[12px] font-semibold text-black/80">
        Appearance
      </h3>
      <div role="radiogroup" aria-labelledby="cc-appearance" className="grid grid-cols-3 gap-1 rounded-[10px] bg-black/[0.06] p-0.5">
        {appearanceModes.map((mode) => {
          const { label, Icon } = modeMeta[mode];
          const selected = appearance === mode;
          return (
            <label
              key={mode}
              className={`flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] text-[12px] has-focus-visible:ring-2 has-focus-visible:ring-(--accent) ${
                selected ? "bg-raised text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]" : "text-black/65 hover:bg-black/[0.05]"
              }`}
            >
              <input
                type="radio"
                name="cc-appearance"
                value={mode}
                checked={selected}
                onChange={() => setAppearance(mode)}
                className="sr-only"
              />
              <Icon className="size-3.5" aria-hidden />
              {label}
            </label>
          );
        })}
      </div>
    </section>
  );
}

interface ToggleTileProps {
  label: string;
  Icon: LucideIcon;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

function ToggleTile({ label, Icon, checked, onChange, description }: ToggleTileProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={description}
      onClick={() => onChange(!checked)}
      className={`${group} flex items-center gap-2.5 text-left outline-none hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-(--accent)`}
    >
      <span
        aria-hidden
        className={`grid size-8 shrink-0 place-items-center rounded-full ${checked ? "bg-(--accent) text-(--accent-fg)" : "bg-black/[0.12] text-black/70"}`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold text-black/85">{label}</span>
        <span className="block text-[11px] text-black/50">{checked ? "On" : "Off"}</span>
      </span>
    </button>
  );
}

function DoNotDisturbTile() {
  const value = useSettingsStore((s) => s.doNotDisturb);
  const set = useSettingsStore((s) => s.setDoNotDisturb);
  return <ToggleTile label="Do Not Disturb" Icon={Moon} checked={value} onChange={set} description="Hides notification banners. They are still kept in Notification Center." />;
}

function ReduceMotionTile() {
  const value = useSettingsStore((s) => s.reduceMotion);
  const set = useSettingsStore((s) => s.setReduceMotion);
  return <ToggleTile label="Reduce Motion" Icon={Accessibility} checked={value} onChange={set} description="Turns off window, wallpaper and Dock animations." />;
}

function BrightnessControl() {
  const brightness = useSettingsStore((s) => s.brightness);
  const setBrightness = useSettingsStore((s) => s.setBrightness);
  return (
    <section className={group} aria-labelledby="cc-brightness">
      <div className="mb-2 flex items-center justify-between">
        <h3 id="cc-brightness" className="text-[12px] font-semibold text-black/80">
          Portfolio Display Brightness
        </h3>
        {brightness < 100 && (
          <button
            type="button"
            onClick={() => setBrightness(100)}
            aria-label="Restore full brightness"
            className="rounded-md px-1.5 py-0.5 text-[11px] text-(--accent) outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Sun className="size-3.5 shrink-0 text-black/45" aria-hidden />
        <input
          type="range"
          min={BRIGHTNESS_MIN}
          max={100}
          step={1}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          aria-labelledby="cc-brightness"
          aria-describedby="cc-brightness-note"
          aria-valuetext={`${brightness} percent`}
          className="h-1 min-w-0 flex-1 accent-(--accent)"
        />
        <Sun className="size-[18px] shrink-0 text-black/60" aria-hidden />
        <span className="w-9 shrink-0 text-right text-[11px] text-black/50 tabular-nums">{brightness}%</span>
      </div>
      <p id="cc-brightness-note" className="mt-1.5 text-[11px] text-black/45">
        Dims this portfolio only. Your device&apos;s display is not changed.
      </p>
    </section>
  );
}

function WallpaperButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Opens (or restores and focuses) System Settings on the Wallpaper section.
        if (openSystemSettings("wallpaper")) onOpen();
      }}
      className={`${group} flex items-center gap-2.5 text-left outline-none hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-(--accent)`}
    >
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.12] text-black/70">
        <ImageIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-[12px] font-semibold text-black/85">Wallpaper</span>
      <ChevronRight className="size-4 text-black/40" aria-hidden />
    </button>
  );
}
