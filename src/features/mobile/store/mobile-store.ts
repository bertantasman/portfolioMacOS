import { create } from "zustand";
import { isMobileAppId } from "../lib/apps";
import { canUseHistory, readPopState, resetBaseEntry, syncHistory } from "../lib/history-sync";
import { back, close, depthOf, goHome, initialNav, launch, parseHash, push, type NavState } from "../lib/router";

export type MobilePhase = "locked" | "unlocking" | "home";
export type MobileOverlay = "control" | "notifications" | "spotlight" | "switcher";

const UNLOCK_KEY = "mobile-unlocked";

interface MobileStore {
  phase: MobilePhase;
  nav: NavState;
  /** How many browser-history entries the navigation currently uses. */
  depth: number;
  overlay: MobileOverlay | null;
  /** 0 = home screen, 1 = App Library. */
  homePage: 0 | 1;
  hydrated: boolean;

  /** Reads the session's unlock flag and any deep link. Call once on the client. */
  hydrate: () => void;
  unlock: () => void;
  finishUnlock: () => void;
  openApp: (app: string, stack?: readonly string[]) => void;
  pushScreen: (screen: string) => void;
  /** The in-app Back control: uses the browser history so the browser's own Back button behaves the same. */
  goBack: () => void;
  goHome: () => void;
  closeApp: (app: string) => void;
  openOverlay: (overlay: MobileOverlay) => void;
  closeOverlay: () => void;
  setHomePage: (page: 0 | 1) => void;
  handlePopState: (event: PopStateEvent) => void;
}

const readUnlocked = () => {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
};
const writeUnlocked = () => {
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* ignore: the lock screen may simply show again */
  }
};

/** Mobile navigation state. Independent of the desktop's stores: nothing here opens a desktop window. */
export const useMobileStore = create<MobileStore>()((set, get) => {
  const apply = (nav: NavState) => {
    const depth = syncHistory(get().depth, nav);
    set({ nav, depth, overlay: null });
  };
  return {
    phase: "locked",
    nav: initialNav,
    depth: 0,
    overlay: null,
    homePage: 0,
    hydrated: false,

    hydrate: () => {
      if (get().hydrated) return;
      const link = canUseHistory() ? parseHash(location.hash, isMobileAppId) : null;
      if (link) {
        // A deep link goes straight to its screen: there is no point asking a recruiter with a link to "unlock" first.
        writeUnlocked();
        resetBaseEntry();
        const nav = launch(initialNav, link.app, link.stack);
        set({ hydrated: true, phase: "home", nav, depth: syncHistory(0, nav) });
        return;
      }
      set({ hydrated: true, phase: readUnlocked() ? "home" : "locked" });
    },

    unlock: () => {
      if (get().phase !== "locked") return;
      writeUnlocked();
      set({ phase: "unlocking" });
    },
    finishUnlock: () => set((s) => (s.phase === "unlocking" ? { phase: "home" } : s)),

    openApp: (app, stack) => {
      if (!isMobileAppId(app)) return;
      apply(launch(get().nav, app, stack));
    },
    pushScreen: (screen) => apply(push(get().nav, screen)),
    goBack: () => {
      const { depth, nav } = get();
      if (depth > 0 && canUseHistory()) history.back();
      else apply(back(nav));
    },
    goHome: () => apply(goHome(get().nav)),
    closeApp: (app) => {
      const nav = close(get().nav, app);
      const depth = syncHistory(get().depth, nav);
      set({ nav, depth });
    },
    openOverlay: (overlay) => set({ overlay }),
    closeOverlay: () => set({ overlay: null }),
    setHomePage: (homePage) => set({ homePage }),

    handlePopState: (event) => {
      const steps = readPopState(event, get().depth);
      if (steps === 0) return;
      let nav = get().nav;
      for (let i = 0; i < steps; i++) nav = back(nav);
      set({ nav, depth: depthOf(nav), overlay: null });
    },
  };
});
