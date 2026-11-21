/**
 * Shared helpers for the documentation blocks (Storybook only): live token reading, contrast
 * maths and the docs table. Values are read from src/styles/tokens.css at runtime.
 */
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark';
export const themes: Theme[] = ['light', 'dark'];
export const themeLabel: Record<Theme, string> = { light: 'Jasny', dark: 'Ciemny' };

/* ---------- reading live values ---------- */

type Rgb = [number, number, number];

/** Resolved colour (r, g, b) of a token inside a probe element of the given theme. */
export function readColor(probe: HTMLElement, token: string): Rgb | null {
  probe.style.color = `var(--${token})`;
  const match = getComputedStyle(probe).color.match(/[\d.]+/g);
  if (!match || match.length < 3) {
    return null;
  }
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

export function readVar(probe: HTMLElement, token: string): string {
  return getComputedStyle(probe).getPropertyValue(`--${token}`).trim();
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export const toHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** Renders hidden light and dark probes and hands them to `read` after layout. */
export function useProbes<T>(
  read: (probes: Record<Theme, HTMLElement>) => T,
): [ReactNode, T | null] {
  const light = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  // Values are read once after mount; keeping `read` in a ref avoids re-reading on every render.
  const readRef = useRef(read);
  const [value, setValue] = useState<T | null>(null);
  useLayoutEffect(() => {
    if (light.current && dark.current) {
      setValue(readRef.current({ light: light.current, dark: dark.current }));
    }
  }, []);
  const probes = (
    <div aria-hidden="true" hidden>
      <div ref={light} className="light" />
      <div ref={dark} className="dark" />
    </div>
  );
  return [probes, value];
}

/* ---------- shared table ---------- */

export function DocTable({
  head,
  children,
  caption,
}: {
  head: string[];
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-body-dense">
        {caption ? (
          <caption className="pb-inline text-left text-meta text-text-muted">{caption}</caption>
        ) : null}
        <thead>
          <tr className="border-b border-border-control">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="min-w-32 px-inline py-row-y text-label font-medium"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <td
      className={`min-w-32 border-b border-border-divider px-inline py-row-y align-top ${mono ? 'font-mono text-code' : ''}`}
    >
      {children}
    </td>
  );
}

export function Swatch({ token, theme }: { token: string; theme: Theme }) {
  return (
    <span className={`${theme} inline-flex items-center gap-inline bg-transparent`}>
      <span
        className="inline-block size-icon-lg rounded-tag border border-border-control"
        style={{ background: `var(--${token})` }}
      />
    </span>
  );
}
