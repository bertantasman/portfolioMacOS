import type { OnboardingStep } from "../types/onboarding";

/** The tour. Each step introduces one idea; targets are looked up by data attribute on the live interface. */
export const onboardingSteps: readonly OnboardingStep[] = [
  {
    id: "desktop",
    title: "Your Desktop, My Portfolio",
    description: "Explore my projects, experience and skills through an interactive desktop inspired by macOS. Everything here is real portfolio content.",
  },
  {
    id: "dock",
    title: "Everything Starts Here",
    description: "Open apps from the Dock: Finder, Safari, Terminal, Notes and Mail. Launchpad has everything else.",
    targetId: "onboarding-dock",
    placement: "top",
  },
  {
    id: "finder",
    title: "Explore My Files",
    description: "Open Finder to browse my projects, resume and portfolio content.",
    targetId: "onboarding-finder",
    placement: "top",
    interactiveTarget: true,
    action: { id: "open-finder", label: "Open Finder" },
  },
  {
    id: "projects",
    title: "See What I’ve Built",
    description: "The Projects folder on the desktop holds my apps, games and development work. Open one to read its case study.",
    targetId: "onboarding-projects",
    placement: "left",
    action: { id: "open-projects", label: "Explore Projects" },
  },
  {
    id: "spotlight",
    title: "Find Anything Instantly",
    description: "Use Spotlight to search projects, applications, notes and files.",
    targetId: "onboarding-spotlight",
    placement: "bottom",
    shortcut: "Ctrl + Space (⌘ Space on a Mac). Your browser may reserve it, so the search icon always works.",
    interactiveTarget: true,
    action: { id: "open-spotlight", label: "Open Spotlight" },
  },
  {
    id: "mission-control",
    title: "Manage Your Workspace",
    description: "View all open windows and switch between applications using Mission Control.",
    shortcut: "Ctrl + Shift + M",
    action: { id: "open-mission-control", label: "Open Mission Control" },
  },
  {
    id: "widgets",
    title: "Make the Desktop Yours",
    description: "Add widgets for projects, the calendar, quick settings and more. Right-click the desktop and choose Edit Widgets.",
    targetId: "onboarding-widgets",
    placement: "right",
    action: { id: "open-widget-gallery", label: "Open Widget Gallery" },
  },
  {
    id: "done",
    title: "You’re All Set!",
    description: "Your desktop is ready. Explore my projects, browse my resume, or get in touch.",
    action: { id: "open-projects", label: "Explore Projects" },
    final: true,
  },
];
