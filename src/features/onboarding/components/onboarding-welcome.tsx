"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { FOLDER } from "@/data/portfolio-file-system";
import { profile } from "@/data/profile";
import { navigateFinderToFolder } from "@/lib/navigation";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useOnboardingStore } from "@/store/onboarding-store";

/** The first-visit welcome window: what this is, what to try, and two ways in. Dismissing it is always one click. */
export function OnboardingWelcome() {
  const reduced = useShouldReduceMotion();
  const skip = useOnboardingStore((s) => s.skip);
  const exploreRef = useRef<HTMLButtonElement>(null);
  const name = profile.displayName?.trim();

  useEffect(() => {
    exploreRef.current?.focus();
  }, []);

  const viewProjects = () => {
    skip();
    // The same Finder folder the Dock and Spotlight lead to; nothing new is built for this.
    navigateFinderToFolder(FOLDER.projects);
  };

  return (
    <motion.div
      className="fixed inset-0 z-(--z-onboarding) grid place-items-center overflow-y-auto bg-[rgb(0_0_0/0.35)] p-4 backdrop-blur-[3px]"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          // Keep Tab inside the dialog while it is up.
          const buttons = [...e.currentTarget.querySelectorAll<HTMLElement>("button")];
          const i = buttons.indexOf(document.activeElement as HTMLElement);
          e.preventDefault();
          buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-welcome-title"
        aria-describedby="onboarding-welcome-body"
        className="relative w-[min(440px,100%)] rounded-[20px] border border-black/10 bg-window p-6 text-black shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl backdrop-saturate-150 sm:p-7"
      >
        <button
          type="button"
          aria-label="Close welcome message"
          onClick={skip}
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-black/50 outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)"
        >
          <X className="size-4" aria-hidden />
        </button>
        <h2 id="onboarding-welcome-title" className="pr-8 text-[20px] leading-7 font-semibold text-black/90">
          Welcome to {name ? `${name}’s` : "my"} portfolio
        </h2>
        <div id="onboarding-welcome-body" className="mt-3 space-y-2.5 text-[14px] leading-6 text-black/70">
          <p>This is a personal portfolio, designed to look and feel like a Mac desktop. You can explore my projects, learn about my background and see the technologies I work with.</p>
          <p>Click an icon in the bar at the bottom to open an app. Finder holds my projects, Safari has my story, and the magnifying glass at the top searches everything.</p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <button
            ref={exploreRef}
            type="button"
            onClick={skip}
            className="h-11 rounded-full bg-(--accent) px-6 text-[14px] font-medium text-(--accent-fg) outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Explore Portfolio
          </button>
          <button type="button" onClick={viewProjects} className="h-11 rounded-full bg-black/[0.07] px-6 text-[14px] text-black/80 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)">
            View Projects
          </button>
        </div>
      </div>
    </motion.div>
  );
}
