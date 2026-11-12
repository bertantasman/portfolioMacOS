"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { ChevronLeft, Home, Layers } from "lucide-react";
import { useMobileStore } from "../store/mobile-store";

interface AppScreenProps {
  title: string;
  children: ReactNode;
  /** Optional controls at the right of the header. */
  trailing?: ReactNode;
  /** The label of the Back control when a detail screen is open. */
  backLabel?: string;
  /** Padding around the content; apps with full-bleed content turn it off. */
  padded?: boolean;
}

const headerButton = "grid size-11 shrink-0 place-items-center rounded-full text-(--accent) outline-none hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-(--accent) active:bg-black/10";

/** The header and scrolling body every mobile app uses: Back (or Home), the title, and the App Switcher button. */
export function AppScreen({ title, children, trailing, backLabel = "Back", padded = true }: AppScreenProps) {
  const active = useMobileStore((s) => s.nav.active);
  const canBack = useMobileStore((s) => (s.nav.active ? (s.nav.stacks[s.nav.active]?.length ?? 0) > 0 : false));
  const goBack = useMobileStore((s) => s.goBack);
  const goHome = useMobileStore((s) => s.goHome);
  const openOverlay = useMobileStore((s) => s.openOverlay);
  const depth = useMobileStore((s) => (s.nav.active ? (s.nav.stacks[s.nav.active]?.length ?? 0) : 0));
  const reduced = useShouldReduceMotion();
  // Going deeper slides in from the right and going back from the left, like a navigation stack.
  const [seen, setSeen] = useState({ depth, direction: 1 });
  if (seen.depth !== depth) setSeen({ depth, direction: depth > seen.depth ? 1 : -1 });
  const direction = seen.direction;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-black/10 bg-window px-1 backdrop-blur-xl">
        {canBack ? (
          <button type="button" onClick={goBack} aria-label={backLabel} className="flex h-11 min-w-11 shrink-0 items-center rounded-full pr-3 pl-1 text-(--accent) outline-none hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-(--accent) active:bg-black/10">
            <ChevronLeft className="size-6" aria-hidden />
            <span className="text-[16px]">{backLabel}</span>
          </button>
        ) : (
          <button type="button" onClick={goHome} aria-label="Home" className={headerButton}>
            <Home className="size-5" aria-hidden />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-black/90" data-app={active ?? undefined}>{title}</h1>
        <div className="flex shrink-0 items-center">
          {trailing}
          <button type="button" onClick={() => openOverlay("switcher")} aria-label="App Switcher" className={headerButton}>
            <Layers className="size-5" aria-hidden />
          </button>
        </div>
      </header>
      <motion.div
        key={depth}
        initial={reduced || depth === 0 && direction === 1 ? false : { x: direction * 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface ${padded ? "px-4 py-4" : ""}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
