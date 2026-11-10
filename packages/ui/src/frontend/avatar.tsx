import { initials } from "../lib/format";

/**
 * Awatar z inicjałami w kolorze wyliczonym z odcienia `hue`.
 * Rozmiar można nadpisać z rodzica zmienną CSS `--avatar-size` (np. `max-[480px]:[--avatar-size:64px]`).
 */
export function Avatar({ name, hue, size = 44 }: { name: string; hue: number; size?: number }) {
  const s = `var(--avatar-size, ${size}px)`;
  return (
    <span
      className="inline-grid flex-none place-items-center rounded-full font-bold"
      style={{ width: s, height: s, fontSize: `calc(${s} * 0.36)`, color: `hsl(${hue} 45% 22%)`, background: `hsl(${hue} 45% 86%)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
