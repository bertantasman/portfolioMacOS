/** Dot shown beneath a running application's icon. Renders nothing otherwise. */
export function DockRunningIndicator({ running }: { running: boolean }) {
  if (!running) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -bottom-[6px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/80"
    />
  );
}
