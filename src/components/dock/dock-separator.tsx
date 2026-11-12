export function DockSeparator({ className = "" }: { className?: string }) {
  return (
    <li
      role="separator"
      aria-orientation="vertical"
      className={`mx-1 h-[calc(var(--dock-icon)*0.85)] w-px shrink-0 self-center bg-white/30 ${className}`}
    />
  );
}
