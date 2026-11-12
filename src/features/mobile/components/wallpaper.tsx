/** An original abstract gradient, built from three soft colour fields. No image to download. */
export function Wallpaper({ blurred }: { blurred?: boolean }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 transition-[filter] duration-300 ${blurred ? "blur-md" : ""}`}
      style={{
        background:
          "radial-gradient(120% 80% at 18% 8%, #7f5cff 0%, transparent 55%), radial-gradient(100% 70% at 88% 32%, #ff6fae 0%, transparent 52%), radial-gradient(130% 90% at 50% 105%, #2fa8ff 0%, transparent 62%), #2a1a78",
      }}
    />
  );
}
