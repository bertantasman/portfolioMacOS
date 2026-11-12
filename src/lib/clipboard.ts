/**
 * Copies text to the clipboard and reports whether it really worked. Uses the async Clipboard API
 * where available (secure contexts), then the legacy `execCommand` path; never claims success otherwise.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* permission denied or blocked: try the fallback */
  }
  if (typeof document === "undefined") return false;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.setAttribute("aria-hidden", "true");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  const previous = document.activeElement;
  try {
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
  }
}
