import type { ReactNode } from "react";

/** A titled group of rows, like a macOS settings panel. */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-5" aria-label={title}>
      {title && <h2 className="mb-1.5 px-1 text-[12px] font-semibold text-black/50">{title}</h2>}
      <div className="divide-y divide-black/[0.08] rounded-[10px] bg-raised shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)]">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="block text-[13px] text-black/85">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[12px] text-black/50">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function SettingsToggle({ id, checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40 ${
        checked ? "bg-(--accent)" : "bg-black/20"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-[2px] left-[2px] size-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

interface SliderProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  label: string;
  startLabel: string;
  endLabel: string;
  disabled?: boolean;
}

export function SettingsSlider({ id, value, onChange, label, startLabel, endLabel, disabled }: SliderProps) {
  return (
    <div className="flex w-[min(260px,40cqw)] min-w-[140px] items-center gap-2 text-[11px] text-black/45">
      <span>{startLabel}</span>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 min-w-0 flex-1 accent-(--accent) disabled:opacity-40"
      />
      <span>{endLabel}</span>
    </div>
  );
}
