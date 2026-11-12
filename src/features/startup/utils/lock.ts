import { useStartupStore } from "@/store/startup-store";

let savedFocus: Element | null = null;

/** Locks the screen (visual only), remembering what had focus so it can be given back on unlock. */
export function lockScreen() {
  savedFocus = document.activeElement;
  useStartupStore.getState().lock();
}

export function takeSavedFocus(): Element | null {
  const el = savedFocus;
  savedFocus = null;
  return el;
}
