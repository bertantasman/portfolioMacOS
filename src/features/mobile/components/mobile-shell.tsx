"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { rememberTouch } from "../lib/last-touch";
import { getMobileApp, isMobileAppId } from "../lib/apps";
import { useMobileStore } from "../store/mobile-store";
import { AppFrame } from "./app-frame";
import { AppSwitcher } from "./app-switcher";
import { AppView } from "./app-views";
import { ControlCenter } from "./control-center";
import { HomeScreen } from "./home-screen";
import { LockScreen } from "./lock-screen";
import { NotificationCenter } from "./notification-center";
import { MobileSpotlight } from "./spotlight";
import { StatusBar } from "./status-bar";
import { Wallpaper } from "./wallpaper";

/**
 * The iOS-inspired shell for narrow screens: lock screen, home screen, full-screen apps and four overlays. It has its own
 * state and never touches the desktop's window manager. Only one overlay is open at a time, and the layers underneath
 * are inert while one is up.
 */
export default function MobileShell() {
  const hydrated = useMobileStore((s) => s.hydrated);
  const phase = useMobileStore((s) => s.phase);
  const active = useMobileStore((s) => s.nav.active);
  const overlay = useMobileStore((s) => s.overlay);
  const hydrate = useMobileStore((s) => s.hydrate);
  const handlePopState = useMobileStore((s) => s.handlePopState);

  useEffect(() => {
    hydrate();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrate, handlePopState]);

  const reduced = useShouldReduceMotion();
  const locked = phase !== "home";
  const app = active && isMobileAppId(active) ? active : null;

  return (
    <main data-mobile-shell onPointerDownCapture={(e) => rememberTouch(e.clientX, e.clientY)} className="fixed inset-0 h-dvh overflow-hidden bg-[#2a1a78] font-sans text-white select-none">
      <Wallpaper />
      {hydrated && (
        <>
          <div className="absolute inset-0" inert={locked || overlay !== null}>
            <motion.div
              className="absolute inset-0 will-change-transform"
              inert={app !== null}
              aria-hidden={app !== null}
              initial={false}
              animate={reduced ? undefined : { scale: app ? 0.9 : 1, opacity: app ? 0.5 : 1 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <HomeScreen />
              <StatusBar />
            </motion.div>
            <AnimatePresence>
              {app && (
                <AppFrame key={app} label={getMobileApp(app)?.name ?? app}>
                  <AppView app={app} />
                </AppFrame>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {overlay === "control" && <ControlCenter key="control" />}
            {overlay === "notifications" && <NotificationCenter key="notifications" />}
            {overlay === "spotlight" && <MobileSpotlight key="spotlight" />}
            {overlay === "switcher" && <AppSwitcher key="switcher" />}
          </AnimatePresence>
          <AnimatePresence>{locked && <LockScreen key="lock" unlocking={phase === "unlocking"} />}</AnimatePresence>
        </>
      )}
    </main>
  );
}
