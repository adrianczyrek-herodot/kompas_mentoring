import { initials } from "../lib/format";

/** Awatar z inicjałami w kolorze wyliczonym z odcienia `hue`. */
export function Avatar({ name, hue, size = 44 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="inline-grid flex-none place-items-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        color: `hsl(${hue} 45% 22%)`,
        background: `hsl(${hue} 45% 86%)`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
