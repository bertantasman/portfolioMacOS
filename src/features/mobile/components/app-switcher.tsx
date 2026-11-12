"use client";

import Image from "next/image";
import { useRef } from "react";
import { Home, X } from "lucide-react";
import { getMobileApp } from "../lib/apps";
import { screenLabel } from "../lib/labels";
import { useMobileStore } from "../store/mobile-store";
import { OverlaySheet } from "./overlay-sheet";

function Card({ app }: { app: string }) {
  const info = getMobileApp(app);
  const stack = useMobileStore((s) => s.nav.stacks[app]);
  const openApp = useMobileStore((s) => s.openApp);
  const closeApp = useMobileStore((s) => s.closeApp);
  const start = useRef<number | null>(null);
  if (!info) return null;
  const label = screenLabel(app, stack ?? []);
  return (
    <li
      className="w-[62vw] max-w-[260px] shrink-0 snap-center"
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        // Swiping a card up closes it, like the real thing; the X button does the same.
        if (start.current !== null && start.current - e.clientY > 80) closeApp(app);
        start.current = null;
      }}
    >
      <div className="relative">
        <button type="button" onClick={() => openApp(app)} className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-white/20 bg-white/15 p-4 text-center outline-none backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-white/90 active:scale-[0.98]">
          <Image src={info.icon} alt="" width={128} height={128} unoptimized className="size-16 rounded-2xl" />
          <span className="text-[17px] font-semibold">{info.name}</span>
          {label && <span className="line-clamp-3 text-[13px] text-white/75">{label}</span>}
        </button>
        <button type="button" onClick={() => closeApp(app)} aria-label={`Close ${info.name}`} className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-black/40 outline-none focus-visible:ring-2 focus-visible:ring-white/90">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

/** The recently used apps as cards (at most eight). Tap to resume, swipe up or press × to close, Home to leave. */
export function AppSwitcher() {
  const recents = useMobileStore((s) => s.nav.recents);
  const close = useMobileStore((s) => s.closeOverlay);
  const goHome = useMobileStore((s) => s.goHome);
  return (
    <OverlaySheet label="App Switcher" placement="full" className="bg-[#14122a]/80 backdrop-blur-2xl">
      <h2 className="px-5 pt-4 text-[17px] font-semibold">Recent apps</h2>
      <div className="flex min-h-0 flex-1 items-center">
        {recents.length === 0 ? (
          <p role="status" className="w-full px-6 text-center text-[14px] text-white/75">No recent apps. Open one from the home screen.</p>
        ) : (
          <ul className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-[19vw] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recents.map((app) => <Card key={app} app={app} />)}
          </ul>
        )}
      </div>
      <div className="flex justify-center gap-3 pb-6">
        <button type="button" data-autofocus onClick={() => { close(); goHome(); }} className="flex h-12 items-center gap-2 rounded-full bg-white/90 px-6 text-[15px] font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95">
          <Home className="size-4" aria-hidden />
          Home
        </button>
        <button type="button" onClick={close} className="h-12 rounded-full bg-white/15 px-6 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-white/90">
          Close
        </button>
      </div>
    </OverlaySheet>
  );
}
